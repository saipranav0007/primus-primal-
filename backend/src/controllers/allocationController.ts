import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { AllocationEngine } from '../engines/allocationEngine';
import { PickingEngine } from '../engines/pickingEngine';

export const getAllocations = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);

    const allocations = await prisma.allocation.findMany({
      where,
      include: {
        order: {
          include: {
            items: { include: { product: true } },
            warehouse: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: allocations.length, data: allocations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const evaluateOrderAllocation = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const firstItem = order.items[0];
    if (!firstItem) {
      return res.status(400).json({ success: false, error: 'Order contains no items' });
    }

    const sources = firstItem.product.inventories.map((inv) => ({
      warehouseCode: inv.warehouse?.code || 'WH-A',
      rackCode: inv.location?.rack?.code || 'A01',
      locationBin: inv.location?.binCode || 'A01-L1-B1',
      availableQty: inv.available,
      reservedQty: inv.reserved,
      productId: firstItem.product.id,
      productName: firstItem.product.name,
    }));

    const hoursRemaining = Math.max(0.5, (new Date(order.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60));

    const result = AllocationEngine.computeAllocation(firstItem.requestedQty, sources, {
      orderNumber: order.orderNumber,
      productName: firstItem.product.name,
      priorityScore: order.priorityScore,
      slaHoursRemaining: hoursRemaining,
    });

    res.json({ success: true, data: { order, allocationPlan: result } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const approveAllocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customBreakdown } = req.body;

    const allocation = await prisma.allocation.findUnique({
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

    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }

    // Update allocation record to APPROVED
    const updatedAllocation = await prisma.allocation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    // Update order stage to ALLOCATED
    const updatedOrder = await prisma.order.update({
      where: { id: allocation.orderId },
      data: { stage: 'ALLOCATED' },
      include: { items: { include: { product: true } } },
    });

    // Deduct available stock & reserve units in inventory
    const orderItem = allocation.order.items[0];
    if (orderItem) {
      const inv = orderItem.product.inventories[0];
      if (inv) {
        const reserveCount = Math.min(inv.quantity, allocation.allocatedQty);
        await prisma.inventory.update({
          where: { id: inv.id },
          data: {
            reserved: { increment: reserveCount },
            available: Math.max(0, inv.quantity - (inv.reserved + reserveCount)),
          },
        });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: 'ALLOCATION_APPROVED',
        entityType: 'ALLOCATION',
        entityId: allocation.id,
        details: `Allocation for order ${allocation.order.orderNumber} approved: ${allocation.recommendedAction}`,
      },
    });

    emitEvent('allocation.approved', { allocation: updatedAllocation, order: updatedOrder });
    emitEvent('inventory.updated', { orderNumber: allocation.order.orderNumber });

    res.json({ success: true, data: { allocation: updatedAllocation, order: updatedOrder } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const rejectAllocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const allocation = await prisma.allocation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reason: reason ? `Rejected by Supervisor: ${reason}` : 'Rejected by Supervisor',
      },
    });

    res.json({ success: true, data: allocation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
