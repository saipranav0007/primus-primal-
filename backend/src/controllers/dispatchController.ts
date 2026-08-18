import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';

export const getShipments = async (req: Request, res: Response) => {
  try {
    const { status, carrier } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (carrier && carrier !== 'ALL') where.carrier = String(carrier);

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier } = req.body;

    const updated = await prisma.shipment.update({
      where: { id },
      data: {
        status: status || undefined,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
        dispatchTime: status === 'DISPATCHED' ? new Date() : undefined,
      },
      include: { order: true },
    });

    if (status === 'DISPATCHED' && updated.orderId) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: { stage: 'DISPATCHED' },
      });
      emitEvent('order.stage.changed', { orderId: updated.orderId, newStage: 'DISPATCHED' });
    }

    emitEvent('shipment.updated', { shipment: updated });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
