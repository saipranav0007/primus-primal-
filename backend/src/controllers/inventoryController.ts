import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { ReorderEngine } from '../engines/reorderEngine';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { status, category, warehouseId, search } = req.query;

    const where: any = {};
    if (warehouseId && warehouseId !== 'ALL' && warehouseId !== 'undefined') where.warehouseId = String(warehouseId);
    if (status && status !== 'ALL' && status !== 'undefined') where.status = String(status);

    if (category && category !== 'ALL' && category !== 'undefined') {
      where.product = { category: String(category) };
    }

    if (search && search !== 'undefined' && String(search).trim() !== '') {
      where.OR = [
        { product: { name: { contains: String(search) } } },
        { product: { sku: { contains: String(search) } } },
        { location: { binCode: { contains: String(search) } } },
        { location: { rack: { code: { contains: String(search) } } } },
      ];
    }

    const inventories = await prisma.inventory.findMany({
      where,
      include: {
        product: true,
        location: {
          include: {
            rack: {
              include: { zone: true },
            },
          },
        },
        warehouse: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const enriched = inventories.map((inv) => {
      const stockValue = inv.quantity * (inv.product?.price || 0);
      const prediction = ReorderEngine.evaluateProductStock({
        ...inv.product,
        inventories: [inv],
      });

      return {
        ...inv,
        stockValue,
        reorderPrediction: prediction,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            movements: {
              take: 15,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        location: {
          include: {
            rack: {
              include: { zone: true },
            },
          },
        },
        warehouse: true,
      },
    });

    if (!inventory) {
      return res.status(404).json({ success: false, error: 'Inventory record not found' });
    }

    const prediction = ReorderEngine.evaluateProductStock({
      ...inventory.product,
      inventories: [inventory],
    });

    res.json({
      success: true,
      data: {
        ...inventory,
        reorderPrediction: prediction,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, reserved, movementType, reason } = req.body;

    const current = await prisma.inventory.findUnique({
      where: { id },
      include: { product: true, location: true },
    });

    if (!current) {
      return res.status(404).json({ success: false, error: 'Inventory record not found' });
    }

    const newQty = quantity !== undefined ? Number(quantity) : current.quantity;
    const newReserved = reserved !== undefined ? Number(reserved) : current.reserved;
    const available = Math.max(0, newQty - newReserved);

    let status = 'HEALTHY';
    if (available === 0) status = 'OUT_OF_STOCK';
    else if (available <= (current.product?.safetyStock || 10)) status = 'CRITICAL';
    else if (available <= (current.product?.reorderPoint || 20)) status = 'LOW_STOCK';
    else if (available > 150) status = 'OVERSTOCK';

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: newQty,
        reserved: newReserved,
        available,
        status,
      },
      include: {
        product: true,
        location: { include: { rack: true } },
        warehouse: true,
      },
    });

    // Record movement audit
    if (newQty !== current.quantity) {
      await prisma.inventoryMovement.create({
        data: {
          productId: current.productId,
          sourceLocId: current.locationId,
          quantity: Math.abs(newQty - current.quantity),
          movementType: movementType || (newQty > current.quantity ? 'INBOUND' : 'ADJUSTMENT'),
          reason: reason || 'Manual inventory update via PRIMAL console',
          createdBy: 'Warehouse Supervisor',
        },
      });
    }

    // Emit real-time update
    emitEvent('inventory.updated', { inventory: updated });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getReorderPredictions = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventories: true,
      },
    });

    const predictions = products
      .map((p) =>
        ReorderEngine.evaluateProductStock({
          ...p,
          inventories: p.inventories,
        })
      )
      .filter((p) => p.riskLevel !== 'HEALTHY')
      .sort((a, b) => (a.daysRemaining > b.daysRemaining ? 1 : -1));

    res.json({ success: true, count: predictions.length, data: predictions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
