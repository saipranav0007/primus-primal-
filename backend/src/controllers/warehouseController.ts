import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getWarehouseSpatialLayout = async (req: Request, res: Response) => {
  try {
    const warehouse = await prisma.warehouse.findFirst({
      include: {
        zones: {
          include: {
            racks: {
              include: {
                locations: {
                  include: {
                    inventories: {
                      include: { product: true },
                    },
                  },
                },
                exceptions: {
                  where: { status: { not: 'RESOLVED' } },
                },
              },
            },
          },
        },
      },
    });

    if (!warehouse) {
      return res.status(404).json({ success: false, error: 'Warehouse not found' });
    }

    // Process racks with dynamic health status based on aggregate inventory
    const processedZones = warehouse.zones.map((zone) => {
      const processedRacks = zone.racks.map((rack) => {
        let totalUnits = 0;
        let totalReserved = 0;
        let totalAvailable = 0;
        const productsMap = new Map<string, any>();

        for (const loc of rack.locations) {
          for (const inv of loc.inventories) {
            totalUnits += inv.quantity;
            totalReserved += inv.reserved;
            totalAvailable += inv.available;
            if (inv.product) {
              productsMap.set(inv.product.id, {
                sku: inv.product.sku,
                name: inv.product.name,
                category: inv.product.category,
                quantity: inv.quantity,
                available: inv.available,
                price: inv.product.price,
              });
            }
          }
        }

        let dynamicStatus = 'HEALTHY';
        if (totalUnits === 0) dynamicStatus = 'OUT_OF_STOCK';
        else if (totalAvailable <= 5) dynamicStatus = 'CRITICAL';
        else if (totalAvailable <= 15) dynamicStatus = 'LOW';
        if (rack.exceptions && rack.exceptions.length > 0) dynamicStatus = 'CRITICAL';

        return {
          ...rack,
          status: dynamicStatus,
          totalUnits,
          totalReserved,
          totalAvailable,
          products: Array.from(productsMap.values()),
        };
      });

      return {
        ...zone,
        racks: processedRacks,
      };
    });

    res.json({
      success: true,
      data: {
        warehouse: {
          id: warehouse.id,
          code: warehouse.code,
          name: warehouse.name,
          location: warehouse.location,
          capacity: warehouse.capacity,
        },
        zones: processedZones,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
