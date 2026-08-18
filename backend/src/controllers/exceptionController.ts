import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { ExceptionEngine } from '../engines/exceptionEngine';

export const getExceptions = async (req: Request, res: Response) => {
  try {
    const { type, severity, status } = req.query;

    const where: any = {};
    if (type && type !== 'ALL' && type !== 'undefined') where.type = String(type);
    if (severity && severity !== 'ALL' && severity !== 'undefined') where.severity = String(severity);
    if (status && status !== 'ALL' && status !== 'undefined') where.status = String(status);

    const exceptions = await prisma.exception.findMany({
      where,
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
        product: true,
        rack: {
          include: { zone: true },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    const enriched = exceptions.map((exc) => {
      const plan = ExceptionEngine.generateResolutionPlan({
        type: exc.type,
        severity: exc.severity,
        description: exc.description,
        orderNumber: exc.order?.orderNumber,
        productSku: exc.product?.sku,
        productName: exc.product?.name,
        stationCode: exc.stationCode || undefined,
      });

      return {
        ...exc,
        resolutionPlan: plan,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createException = async (req: Request, res: Response) => {
  try {
    const { type, severity, orderId, productId, rackId, stationCode, description, impact } = req.body;

    const count = await prisma.exception.count();
    const exceptionNumber = `EXC-${2050 + count}`;

    const plan = ExceptionEngine.generateResolutionPlan({
      type: type || 'LOW_STOCK',
      severity: severity || 'MEDIUM',
      description: description || 'Operational discrepancy detected by automated telemetry',
    });

    const exception = await prisma.exception.create({
      data: {
        exceptionNumber,
        type: type || 'LOW_STOCK',
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        orderId: orderId || null,
        productId: productId || null,
        rackId: rackId || null,
        stationCode: stationCode || null,
        description: description || 'Warehouse anomaly flagged for resolution',
        impact: impact || plan.expectedImpact,
        primalRecommendation: plan.summary,
        confidenceScore: plan.confidenceScore,
      },
      include: {
        order: true,
        product: true,
        rack: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'EXCEPTION_DETECTED',
        entityType: 'EXCEPTION',
        entityId: exception.id,
        details: `[${exception.severity}] ${exception.type} exception created: ${exception.description}`,
      },
    });

    emitEvent('exception.created', { exception });

    res.status(201).json({ success: true, data: exception });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const resolveException = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const current = await prisma.exception.findUnique({
      where: { id },
      include: { order: true, product: true },
    });

    if (!current) {
      return res.status(404).json({ success: false, error: 'Exception not found' });
    }

    const updated = await prisma.exception.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolutionNotes: resolutionNotes || `Resolved automatically via PRIMAL Decision Action: ${current.primalRecommendation}`,
      },
      include: { order: true, product: true },
    });

    // If order was blocked at stage, progress it
    if (current.orderId) {
      const order = await prisma.order.findUnique({ where: { id: current.orderId } });
      if (order && (order.stage === 'CREATED' || order.stage === 'PRIORITIZED')) {
        await prisma.order.update({
          where: { id: order.id },
          data: { stage: 'ALLOCATED' },
        });
        emitEvent('order.stage.changed', { orderId: order.id, newStage: 'ALLOCATED' });
      }
    }

    await prisma.activityLog.create({
      data: {
        action: 'EXCEPTION_RESOLVED',
        entityType: 'EXCEPTION',
        entityId: updated.id,
        details: `Exception ${updated.exceptionNumber} [${updated.type}] resolved. Operational state reconciled.`,
      },
    });

    emitEvent('exception.resolved', { exception: updated });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
