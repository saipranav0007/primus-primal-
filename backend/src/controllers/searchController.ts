import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim() === '') {
      return res.json({
        success: true,
        data: { products: [], orders: [], inventory: [], exceptions: [] },
      });
    }

    const query = String(q).trim();

    const [products, orders, inventory, exceptions] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
            { brand: { contains: query } },
            { category: { contains: query } },
          ],
        },
        take: 6,
      }),
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: query } },
            { customerName: { contains: query } },
            { customerCity: { contains: query } },
          ],
        },
        take: 6,
      }),
      prisma.inventory.findMany({
        where: {
          OR: [
            { product: { name: { contains: query } } },
            { product: { sku: { contains: query } } },
            { location: { binCode: { contains: query } } },
            { location: { rack: { code: { contains: query } } } },
          ],
        },
        include: {
          product: true,
          location: { include: { rack: true } },
        },
        take: 6,
      }),
      prisma.exception.findMany({
        where: {
          OR: [
            { exceptionNumber: { contains: query } },
            { description: { contains: query } },
            { type: { contains: query } },
          ],
        },
        take: 6,
      }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        orders,
        inventory,
        exceptions,
        totalMatches: products.length + orders.length + inventory.length + exceptions.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
