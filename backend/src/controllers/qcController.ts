import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';

export const getQualityChecks = async (req: Request, res: Response) => {
  try {
    const checks = await prisma.qualityCheck.findMany({
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    res.json({ success: true, count: checks.length, data: checks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitQualityCheck = async (req: Request, res: Response) => {
  try {
    const { orderId, inspectorName, itemsVerified, damageFound, wrongSkuFound, notes, passed } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const isPassed = passed !== undefined ? passed : !damageFound && !wrongSkuFound;

    const qc = await prisma.qualityCheck.create({
      data: {
        orderId,
        inspectorName: inspectorName || 'Pooja Patel',
        itemsVerified: itemsVerified !== undefined ? itemsVerified : true,
        damageFound: !!damageFound,
        wrongSkuFound: !!wrongSkuFound,
        notes: notes || (isPassed ? 'Verified complete order match.' : 'Inspection defect flagged.'),
        passed: isPassed,
      },
    });

    if (isPassed) {
      // Progress order to READY
      await prisma.order.update({
        where: { id: orderId },
        data: { stage: 'READY' },
      });
      emitEvent('order.stage.changed', { orderId, newStage: 'READY' });
      emitEvent('qc.completed', { qc, passed: true });
    } else {
      // Create backend exception for QC failure
      const count = await prisma.exception.count();
      const exc = await prisma.exception.create({
        data: {
          exceptionNumber: `EXC-${2040 + count}`,
          type: damageFound ? 'DAMAGED_ITEM' : 'WRONG_SKU',
          severity: 'HIGH',
          status: 'ACTION_REQUIRED',
          orderId: order.id,
          productId: order.items[0]?.productId,
          description: `QC Inspector ${inspectorName || 'Pooja'} rejected parcel: ${notes || (damageFound ? 'Cosmetic packaging damage' : 'Barcode mismatch')}`,
          impact: 'Halts dispatch release; potential 45 min SLA delay if replacement SKU is not immediately quarantined',
          primalRecommendation: 'Quarantine defective unit and auto-allocate replacement unit from backup Zone B shelf.',
          confidenceScore: 97,
        },
      });

      emitEvent('exception.created', { exception: exc });
      emitEvent('qc.completed', { qc, passed: false, exception: exc });
    }

    res.status(201).json({ success: true, data: qc });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
