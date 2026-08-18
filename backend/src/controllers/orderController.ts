import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { PriorityEngine } from '../engines/priorityEngine';
import { PickingEngine } from '../engines/pickingEngine';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { stage, priorityMin, slaRisk, search, warehouseId } = req.query;

    const where: any = {};
    if (warehouseId && warehouseId !== 'ALL' && warehouseId !== 'undefined') where.warehouseId = String(warehouseId);
    if (stage && stage !== 'ALL' && stage !== 'undefined') where.stage = String(stage);
    if (slaRisk && slaRisk !== 'ALL' && slaRisk !== 'undefined') where.slaRisk = String(slaRisk);
    if (priorityMin && priorityMin !== 'undefined') where.priorityScore = { gte: Number(priorityMin) };

    if (search && search !== 'undefined' && String(search).trim() !== '') {
      where.OR = [
        { orderNumber: { contains: String(search) } },
        { customerName: { contains: String(search) } },
        { customerCity: { contains: String(search) } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
        allocations: true,
        pickingTasks: true,
        qualityChecks: true,
        shipments: true,
        warehouse: true,
      },
      orderBy: [{ priorityScore: 'desc' }, { slaDeadline: 'asc' }],
    });

    // Dynamically check and update SLA risk for all orders
    const enriched = orders.map((order) => {
      const liveSlaRisk = PriorityEngine.calculateSlaRisk(order.slaDeadline, order.stage);
      let explanationObj = null;
      try {
        if (order.priorityExplanation) explanationObj = JSON.parse(order.priorityExplanation);
      } catch (e) {}

      return {
        ...order,
        slaRisk: liveSlaRisk,
        priorityExplanationParsed: explanationObj,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventories: {
                  include: {
                    location: {
                      include: { rack: { include: { zone: true } } },
                    },
                    warehouse: true,
                  },
                },
              },
            },
          },
        },
        allocations: true,
        pickingTasks: true,
        qualityChecks: true,
        shipments: true,
        warehouse: true,
        exceptions: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    let explanationObj = null;
    try {
      if (order.priorityExplanation) explanationObj = JSON.parse(order.priorityExplanation);
    } catch (e) {}

    const liveSlaRisk = PriorityEngine.calculateSlaRisk(order.slaDeadline, order.stage);

    res.json({
      success: true,
      data: {
        ...order,
        slaRisk: liveSlaRisk,
        priorityExplanationParsed: explanationObj,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerCity, shippingType, items, slaHours = 6, warehouseId } = req.body;

    const count = await prisma.order.count();
    const orderNumber = `ORD-${1050 + count}`;
    const slaDeadline = new Date(Date.now() + Number(slaHours) * 60 * 60 * 1000);

    // Calculate total order value
    let totalValue = 0;
    const itemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const itemPrice = product.price;
        totalValue += itemPrice * Number(item.quantity);
        itemsData.push({
          productId: product.id,
          requestedQty: Number(item.quantity),
          unitPrice: itemPrice,
        });
      }
    }

    // Default warehouse if not specified
    let targetWhId = warehouseId;
    if (!targetWhId) {
      const defaultWh = await prisma.warehouse.findFirst();
      targetWhId = defaultWh?.id;
    }

    // Calculate Priority Score with PriorityEngine
    const priorityResult = PriorityEngine.calculatePriority({
      slaDeadline,
      shippingType: shippingType || 'STANDARD',
      orderValue: totalValue,
      createdAt: new Date(),
      customerName,
      inventoryAvailable: true,
    });

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || 'Rahul Verma',
        customerEmail: customerEmail || 'rahul.verma@example.in',
        customerCity: customerCity || 'Bengaluru',
        orderValue: totalValue,
        shippingType: shippingType || 'STANDARD',
        priorityScore: priorityResult.totalScore,
        priorityExplanation: JSON.stringify(priorityResult),
        stage: 'CREATED',
        slaDeadline,
        slaRisk: 'LOW',
        warehouseId: targetWhId,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: { include: { product: true } },
        warehouse: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'ORDER_CREATED',
        entityType: 'ORDER',
        entityId: newOrder.id,
        details: `Order ${newOrder.orderNumber} placed for ₹${newOrder.orderValue.toLocaleString('en-IN')}. Priority score computed: ${priorityResult.totalScore}/100.`,
      },
    });

    emitEvent('order.created', { order: newOrder });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const prioritizeOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { overrideScore, overrideReason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    let updatedScore = order.priorityScore;
    let isOverride = order.priorityOverride;
    let explanation = order.priorityExplanation;

    if (overrideScore !== undefined) {
      updatedScore = Math.min(100, Math.max(0, Number(overrideScore)));
      isOverride = true;
      explanation = JSON.stringify({
        isOverride: true,
        reason: overrideReason || 'Manual supervisor override',
        overrideScore: updatedScore,
        originalScore: order.priorityScore,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const result = PriorityEngine.calculatePriority({
        slaDeadline: order.slaDeadline,
        shippingType: order.shippingType,
        orderValue: order.orderValue,
        createdAt: order.createdAt,
        customerName: order.customerName,
      });
      updatedScore = result.totalScore;
      explanation = JSON.stringify(result);
      isOverride = false;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        priorityScore: updatedScore,
        priorityOverride: isOverride,
        priorityOverrideReason: overrideReason,
        priorityExplanation: explanation,
        stage: order.stage === 'CREATED' ? 'PRIORITIZED' : order.stage,
      },
      include: { items: { include: { product: true } } },
    });

    await prisma.activityLog.create({
      data: {
        action: 'ORDER_PRIORITIZED',
        entityType: 'ORDER',
        entityId: updated.id,
        details: `Order ${updated.orderNumber} priority adjusted to ${updatedScore}/100${isOverride ? ' (Supervisor Override)' : ''}.`,
      },
    });

    emitEvent('order.priority.changed', { order: updated });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const advanceOrderStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetStage } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventories: {
                  include: {
                    location: {
                      include: { rack: { include: { zone: true } } },
                    },
                  },
                },
              },
            },
          },
        },
        pickingTasks: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const stages = ['CREATED', 'PRIORITIZED', 'ALLOCATED', 'PICKING', 'PACKING', 'QC', 'READY', 'DISPATCHED'];
    const currentIdx = stages.indexOf(order.stage);
    const nextStage = targetStage || (currentIdx < stages.length - 1 ? stages[currentIdx + 1] : order.stage);

    const updated = await prisma.order.update({
      where: { id },
      data: { stage: nextStage },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventories: {
                  include: {
                    location: {
                      include: { rack: { include: { zone: true } } },
                    },
                  },
                },
              },
            },
          },
        },
        allocations: true,
        pickingTasks: true,
        qualityChecks: true,
        shipments: true,
      },
    });

    // Auto-create picking task if advancing to PICKING
    if (nextStage === 'PICKING' && updated.pickingTasks.length === 0) {
      const pickItems = updated.items.map((item) => {
        const inv = item.product.inventories[0];
        const rack = inv?.location?.rack;
        return {
          sku: item.product.sku,
          productName: item.product.name,
          quantity: item.requestedQty,
          rackCode: rack?.code || 'A01',
          binCode: inv?.location?.binCode || 'A01-L1-B1',
          zone: rack?.zone?.code || 'A',
          posX: rack?.posX || 4,
          posY: rack?.posY || 0,
          posZ: rack?.posZ || 5,
        };
      });

      const routeResult = PickingEngine.optimizePickingRoute(pickItems);

      const pickingTask = await prisma.pickingTask.create({
        data: {
          orderId: order.id,
          pickerName: 'Aarav Sharma',
          status: 'IN_PROGRESS',
          priority: order.priorityScore,
          baselineDistanceM: routeResult.baselineDistanceM,
          optimizedDistanceM: routeResult.optimizedDistanceM,
          savingsPercent: routeResult.savingsPercent,
          routeWaypoints: JSON.stringify(routeResult),
          startedAt: new Date(),
        },
      });

      emitEvent('picking.started', { order: updated, pickingTask, routeResult });
    }

    // Auto-create Quality Check if advancing to QC
    if (nextStage === 'QC') {
      await prisma.qualityCheck.create({
        data: {
          orderId: order.id,
          inspectorName: 'Pooja Patel',
          itemsVerified: true,
          damageFound: false,
          wrongSkuFound: false,
          notes: 'Passed 100% visual and barcode scan check.',
          passed: true,
        },
      });
      emitEvent('qc.completed', { order: updated });
    }

    // Auto-create Shipment record if advancing to READY or DISPATCHED
    if ((nextStage === 'READY' || nextStage === 'DISPATCHED') && updated.shipments.length === 0) {
      const trackingNumber = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id,
          trackingNumber,
          carrier: 'DELHIVERY',
          destinationCity: order.customerCity,
          status: nextStage === 'DISPATCHED' ? 'DISPATCHED' : 'READY',
          dispatchTime: nextStage === 'DISPATCHED' ? new Date() : null,
          estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });

      if (nextStage === 'DISPATCHED') {
        emitEvent('shipment.dispatched', { order: updated, shipment });
      }
    }

    await prisma.activityLog.create({
      data: {
        action: 'ORDER_STAGE_CHANGED',
        entityType: 'ORDER',
        entityId: updated.id,
        details: `Order ${updated.orderNumber} progressed to stage [${nextStage}].`,
      },
    });

    emitEvent('order.stage.changed', { order: updated, previousStage: order.stage, newStage: nextStage });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
