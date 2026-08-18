import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../websocket/socketServer';
import { PriorityEngine } from '../engines/priorityEngine';
import { runSeed } from '../utils/seeder';

export const triggerDemoScenario = async (req: Request, res: Response) => {
  try {
    const { scenarioType } = req.body;

    let scenarioResult: any = {};

    switch (scenarioType) {
      case 'URGENT_ORDER': {
        const headphone = await prisma.product.findFirst({ where: { name: { contains: 'Headphone' } } });
        const warehouse = await prisma.warehouse.findFirst();

        const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const slaDeadline = new Date(Date.now() + 1.2 * 60 * 60 * 1000);

        const priorityResult = PriorityEngine.calculatePriority({
          slaDeadline,
          shippingType: 'SAME_DAY_PRIORITY',
          orderValue: (headphone?.price || 4999) * 10,
          createdAt: new Date(),
          customerName: 'Aarav Enterprise Ltd (VIP)',
          inventoryAvailable: false,
        });

        const order = await prisma.order.create({
          data: {
            orderNumber,
            customerName: 'Aarav Enterprise Ltd (VIP)',
            customerEmail: 'ops@aaraventerprise.in',
            customerCity: 'Bengaluru',
            orderValue: (headphone?.price || 4999) * 10,
            shippingType: 'SAME_DAY_PRIORITY',
            priorityScore: 96,
            priorityExplanation: JSON.stringify(priorityResult),
            stage: 'CREATED',
            slaDeadline,
            slaRisk: 'HIGH',
            warehouseId: warehouse?.id || 'default',
            items: {
              create: [
                {
                  productId: headphone?.id || 'prod-1',
                  requestedQty: 10,
                  unitPrice: headphone?.price || 4999,
                },
              ],
            },
          },
          include: { items: { include: { product: true } } },
        });

        const exc = await prisma.exception.create({
          data: {
            exceptionNumber: `EXC-${Math.floor(2000 + Math.random() * 8000)}`,
            type: 'ALLOCATION_CONFLICT',
            severity: 'CRITICAL',
            status: 'ACTION_REQUIRED',
            orderId: order.id,
            productId: headphone?.id,
            description: `Order ${order.orderNumber} requires 10 × ${headphone?.name || 'Headphones'}. Only 7 units available at WH-A Rack A12.`,
            impact: 'Critical Tier-1 order SLA breach in 1h 12m unless split-allocated from WH-B Rack C09.',
            primalRecommendation: 'Allocate 7 units from WH-A Rack A12 and source remaining 3 units from WH-B Rack C09.',
            confidenceScore: 94,
          },
        });

        scenarioResult = {
          scenario: 'URGENT_ORDER',
          message: `Injected Urgent Order ${order.orderNumber} with SLA urgency and allocation conflict.`,
          order,
          exception: exc,
        };

        emitEvent('demo.scenario.started', scenarioResult);
        emitEvent('order.created', { order });
        emitEvent('exception.created', { exception: exc });
        break;
      }

      case 'STOCKOUT': {
        const keyboard = await prisma.product.findFirst({ where: { name: { contains: 'Keyboard' } } });
        if (keyboard) {
          const inv = await prisma.inventory.findFirst({ where: { productId: keyboard.id } });
          if (inv) {
            await prisma.inventory.update({
              where: { id: inv.id },
              data: { quantity: 2, available: 0, reserved: 2, status: 'CRITICAL' },
            });

            const exc = await prisma.exception.create({
              data: {
                exceptionNumber: `EXC-${Math.floor(2000 + Math.random() * 8000)}`,
                type: 'LOW_STOCK',
                severity: 'HIGH',
                status: 'ACTION_REQUIRED',
                productId: keyboard.id,
                description: `SKU ${keyboard.sku} (${keyboard.name}) has breached critical safety stock threshold (0 available).`,
                impact: 'Subsequent incoming orders will stall and trigger backorder delays.',
                primalRecommendation: `Execute immediate supplier purchase order for 65 units to restore safety buffer.`,
                confidenceScore: 96,
              },
            });

            scenarioResult = {
              scenario: 'STOCKOUT',
              message: `Simulated stockout for ${keyboard.name}. Critical alert and reorder decision triggered.`,
              product: keyboard,
              exception: exc,
            };

            emitEvent('demo.scenario.started', scenarioResult);
            emitEvent('inventory.updated', { product: keyboard });
            emitEvent('exception.created', { exception: exc });
          }
        }
        break;
      }

      case 'DAMAGED_ITEM': {
        const order = await prisma.order.findFirst({
          where: { stage: 'PACKING' },
          include: { items: { include: { product: true } } },
        });

        const exc = await prisma.exception.create({
          data: {
            exceptionNumber: `EXC-${Math.floor(2000 + Math.random() * 8000)}`,
            type: 'DAMAGED_ITEM',
            severity: 'HIGH',
            status: 'ACTION_REQUIRED',
            orderId: order?.id,
            productId: order?.items[0]?.productId,
            description: `Damaged packaging seal detected on order ${order?.orderNumber || 'ORD-1042'} during final packing.`,
            impact: 'Defective unit must not be dispatched; 20-minute SLA window to quarantine and replace.',
            primalRecommendation: 'Quarantine damaged unit to QC Bin and auto-allocate replacement unit from Rack B02.',
            confidenceScore: 97,
          },
        });

        scenarioResult = {
          scenario: 'DAMAGED_ITEM',
          message: `QC Damage exception flagged for ${order?.orderNumber || 'ORD-1042'}.`,
          exception: exc,
        };

        emitEvent('demo.scenario.started', scenarioResult);
        emitEvent('exception.created', { exception: exc });
        break;
      }

      case 'WAREHOUSE_CONGESTION': {
        await prisma.packingStation.update({
          where: { stationCode: 'P03' },
          data: {
            queueDepth: 18,
            avgPackingTimeMin: 8.6,
            status: 'OVERLOADED',
          },
        });

        const exc = await prisma.exception.create({
          data: {
            exceptionNumber: `EXC-${Math.floor(2000 + Math.random() * 8000)}`,
            type: 'WAREHOUSE_CONGESTION',
            severity: 'CRITICAL',
            status: 'ACTION_REQUIRED',
            stationCode: 'P03',
            description: `Packing Station P03 bottleneck: 18 orders queued, average packing cycle time elevated to 8.6 min.`,
            impact: 'Downstream dispatch carrier departure delayed by estimated 42 minutes.',
            primalRecommendation: 'Shift 1 packing operator from Station P01 to Station P03 and activate dual-packer conveyor mode.',
            confidenceScore: 92,
          },
        });

        scenarioResult = {
          scenario: 'WAREHOUSE_CONGESTION',
          message: 'Packing Station P03 bottleneck simulated with queue depth of 18 orders.',
          exception: exc,
        };

        emitEvent('demo.scenario.started', scenarioResult);
        emitEvent('exception.created', { exception: exc });
        emitEvent('bottleneck.detected', { stationCode: 'P03', queueDepth: 18 });
        break;
      }

      default:
        return res.status(400).json({ success: false, error: 'Unknown scenario type' });
    }

    res.json({ success: true, data: scenarioResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resetDemoData = async (req: Request, res: Response) => {
  try {
    await runSeed();

    emitEvent('demo.reset', {
      message: 'Demo database reset to clean default warehouse state.',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'PRIMAL Warehouse database successfully reset to clean demo seed state.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
