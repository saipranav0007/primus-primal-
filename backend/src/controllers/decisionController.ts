import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { DecisionEngine } from '../engines/decisionEngine';
import { BottleneckEngine } from '../engines/bottleneckEngine';
import { ReorderEngine } from '../engines/reorderEngine';

export const getDecisions = async (req: Request, res: Response) => {
  try {
    const [orders, products, stations, exceptions, savedDecisions] = await Promise.all([
      prisma.order.findMany({
        where: { stage: { not: 'DISPATCHED' } },
        orderBy: { priorityScore: 'desc' },
      }),
      prisma.product.findMany({ include: { inventories: true } }),
      prisma.packingStation.findMany(),
      prisma.exception.findMany({ where: { status: { not: 'RESOLVED' } } }),
      prisma.decisionRecommendation.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    const bottlenecks = BottleneckEngine.analyzePackingStations(stations);
    const stockoutProducts = products
      .map((p) => ReorderEngine.evaluateProductStock({ ...p, inventories: p.inventories }))
      .filter((p) => p.riskLevel !== 'HEALTHY');

    const generated = DecisionEngine.generateDecisions({
      urgentOrders: orders,
      stockoutProducts,
      bottlenecks,
      openExceptions: exceptions,
      utilizationRate: 88,
    });

    // Merge with any persistent database decisions
    const dbDecisions = savedDecisions.map((d) => {
      let parsedData = {};
      let parsedPayload = {};
      try {
        if (d.dataConsidered) parsedData = JSON.parse(d.dataConsidered);
        if (d.actionPayload) parsedPayload = JSON.parse(d.actionPayload);
      } catch (e) {}
      return {
        id: d.id,
        category: d.category,
        problem: d.problem,
        dataConsidered: parsedData,
        decision: d.decision,
        reason: d.reason,
        expectedImpact: d.expectedImpact,
        confidenceScore: d.confidenceScore,
        status: d.status,
        actionPayload: parsedPayload,
      };
    });

    // Combine generated + db decisions
    const combined = [...generated, ...dbDecisions];

    res.json({
      success: true,
      count: combined.length,
      data: combined,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const executeDecision = async (req: Request, res: Response) => {
  try {
    const { actionType, orderId, orderNumber, sourceStation, targetStation, productId, sku, quantity } = req.body;

    let executionResult = 'Decision executed successfully';

    if (actionType === 'EXPEDITE_ORDER' && (orderId || orderNumber)) {
      const order = await prisma.order.findFirst({
        where: orderId ? { id: orderId } : { orderNumber },
      });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            priorityScore: 98,
            priorityOverride: true,
            priorityOverrideReason: 'PRIMAL Decision Engine: Expedited SLA fast-track',
            stage: order.stage === 'CREATED' ? 'ALLOCATED' : order.stage,
          },
        });
        emitEvent('order.priority.changed', { orderId: order.id, priorityScore: 98 });
        executionResult = `Order ${order.orderNumber} priority boosted to 98/100 and fast-tracked.`;
      }
    } else if (actionType === 'REALLOCATE_WORKER' && targetStation) {
      const target = await prisma.packingStation.findUnique({ where: { stationCode: targetStation } });
      if (target) {
        await prisma.packingStation.update({
          where: { stationCode: targetStation },
          data: {
            queueDepth: Math.max(2, target.queueDepth - 7),
            avgPackingTimeMin: 4.6,
            status: 'PACKING',
          },
        });
        emitEvent('packing.rebalanced', { targetStation, sourceStation });
        executionResult = `Worker reallocated from ${sourceStation || 'P01'} to ${targetStation}. Congestion reduced.`;
      }
    } else if (actionType === 'CREATE_PURCHASE_ORDER' && (productId || sku)) {
      const prod = await prisma.product.findFirst({
        where: productId ? { id: productId } : { sku },
      });
      if (prod) {
        const defaultInv = await prisma.inventory.findFirst({ where: { productId: prod.id } });
        if (defaultInv) {
          const qtyToAdd = Number(quantity) || 50;
          await prisma.inventory.update({
            where: { id: defaultInv.id },
            data: {
              quantity: { increment: qtyToAdd },
              available: { increment: qtyToAdd },
              status: 'HEALTHY',
            },
          });
          emitEvent('inventory.updated', { productId: prod.id, sku: prod.sku });
          executionResult = `Supplier PO issued for ${qtyToAdd} units of ${prod.name}. Stock updated.`;
        }
      }
    }

    await prisma.activityLog.create({
      data: {
        action: 'DECISION_EXECUTED',
        entityType: 'DECISION',
        details: executionResult,
      },
    });

    emitEvent('decision.executed', { actionType, result: executionResult });

    res.json({
      success: true,
      message: executionResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
