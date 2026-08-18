import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, stockStatus } = req.query;

    const where: any = {};
    if (category && category !== 'ALL' && category !== 'undefined') {
      where.category = String(category);
    }
    if (search && search !== 'undefined' && String(search).trim() !== '') {
      where.OR = [
        { name: { contains: String(search) } },
        { sku: { contains: String(search) } },
        { brand: { contains: String(search) } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
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
      orderBy: { name: 'asc' },
    });

    const enriched = products.map((p) => {
      const totalQty = p.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
      const totalReserved = p.inventories.reduce((sum, inv) => sum + inv.reserved, 0);
      const totalAvailable = Math.max(0, totalQty - totalReserved);

      let status = 'HEALTHY';
      if (totalAvailable === 0) status = 'OUT_OF_STOCK';
      else if (totalAvailable <= p.safetyStock) status = 'CRITICAL';
      else if (totalAvailable <= p.reorderPoint) status = 'LOW_STOCK';
      else if (totalAvailable > 150) status = 'OVERSTOCK';

      return {
        ...p,
        totalQuantity: totalQty,
        totalReserved,
        totalAvailable,
        stockStatus: status,
      };
    });

    // Apply stock status filter if provided
    const filtered = stockStatus && stockStatus !== 'ALL'
      ? enriched.filter((p) => p.stockStatus === stockStatus)
      : enriched;

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        inventories: {
          include: {
            location: {
              include: { rack: { include: { zone: true } } },
            },
            warehouse: true,
          },
        },
        movements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        orderItems: {
          include: { order: true },
          take: 10,
          orderBy: { id: 'desc' },
        },
        exceptions: {
          where: { status: { not: 'RESOLVED' } },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const totalQty = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = product.inventories.reduce((sum, inv) => sum + inv.reserved, 0);
    const totalAvailable = Math.max(0, totalQty - totalReserved);

    res.json({
      success: true,
      data: {
        ...product,
        totalQuantity: totalQty,
        totalReserved,
        totalAvailable,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
    });
    emitEvent('product.created', { product });
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
