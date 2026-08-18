import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { PickingEngine } from '../engines/pickingEngine';

export const getPickingTasks = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);

    const tasks = await prisma.pickingTask.findMany({
      where,
      include: {
        order: {
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
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    const parsed = tasks.map((t) => {
      let routeData = null;
      try {
        if (t.routeWaypoints) routeData = JSON.parse(t.routeWaypoints);
      } catch (e) {}

      return {
        ...t,
        routeData,
      };
    });

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const optimizeTaskRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.pickingTask.findUnique({
      where: { id },
      include: {
        order: {
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
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Picking task not found' });
    }

    const pickItems = task.order.items.map((item) => {
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

    const updated = await prisma.pickingTask.update({
      where: { id },
      data: {
        baselineDistanceM: routeResult.baselineDistanceM,
        optimizedDistanceM: routeResult.optimizedDistanceM,
        savingsPercent: routeResult.savingsPercent,
        routeWaypoints: JSON.stringify(routeResult),
        totalSteps: routeResult.optimizedWaypoints.length,
      },
      include: { order: true },
    });

    emitEvent('picking.optimized', { taskId: updated.id, routeResult });

    res.json({ success: true, data: { task: updated, routeResult } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateTaskProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentStep, status } = req.body;

    const currentTask = await prisma.pickingTask.findUnique({ where: { id } });
    if (!currentTask) {
      return res.status(404).json({ success: false, error: 'Picking task not found' });
    }

    const newStep = currentStep !== undefined ? Number(currentStep) : currentTask.currentStep + 1;
    const isCompleted = newStep >= currentTask.totalSteps || status === 'COMPLETED';

    const updated = await prisma.pickingTask.update({
      where: { id },
      data: {
        currentStep: newStep,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isCompleted ? new Date() : null,
      },
      include: { order: true },
    });

    // If completed, progress order to PACKING
    if (isCompleted && updated.order.stage === 'PICKING') {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: { stage: 'PACKING' },
      });
      emitEvent('order.stage.changed', { orderId: updated.orderId, newStage: 'PACKING' });
    }

    emitEvent('picking.progress', {
      taskId: updated.id,
      currentStep: updated.currentStep,
      totalSteps: updated.totalSteps,
      status: updated.status,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
