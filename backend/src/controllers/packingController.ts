import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { BottleneckEngine } from '../engines/bottleneckEngine';

export const getPackingStations = async (req: Request, res: Response) => {
  try {
    const stations = await prisma.packingStation.findMany({
      orderBy: { stationCode: 'asc' },
    });

    const bottlenecks = BottleneckEngine.analyzePackingStations(stations);

    res.json({
      success: true,
      count: stations.length,
      data: stations,
      bottlenecks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const reallocateWorker = async (req: Request, res: Response) => {
  try {
    const { sourceStationCode, targetStationCode } = req.body;

    const source = await prisma.packingStation.findUnique({ where: { stationCode: sourceStationCode } });
    const target = await prisma.packingStation.findUnique({ where: { stationCode: targetStationCode } });

    if (!source || !target) {
      return res.status(404).json({ success: false, error: 'Packing stations not found' });
    }

    // Rebalance: reduce target queue processing time, mark target active, reduce queue
    const updatedTarget = await prisma.packingStation.update({
      where: { stationCode: targetStationCode },
      data: {
        queueDepth: Math.max(2, target.queueDepth - 6),
        avgPackingTimeMin: 4.8,
        status: 'PACKING',
      },
    });

    const updatedSource = await prisma.packingStation.update({
      where: { stationCode: sourceStationCode },
      data: {
        status: 'AVAILABLE',
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'WORKER_REBALANCED',
        entityType: 'PACKING',
        details: `Worker from Station ${sourceStationCode} reassigned to congested Station ${targetStationCode}. Queue cleared by 6 units.`,
      },
    });

    emitEvent('packing.rebalanced', {
      sourceStation: updatedSource,
      targetStation: updatedTarget,
    });

    res.json({
      success: true,
      message: `Worker reallocated successfully from ${sourceStationCode} to ${targetStationCode}`,
      data: { source: updatedSource, target: updatedTarget },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
