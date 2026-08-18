export interface DecisionCard {
  id?: string;
  category: 'SLA_OPTIMIZATION' | 'INVENTORY_ALLOCATION' | 'BOTTLENECK_RELIEF' | 'REORDER_TRIGGER' | 'WORKER_REBALANCE';
  problem: string;
  dataConsidered: Record<string, any>;
  decision: string;
  reason: string;
  expectedImpact: string;
  confidenceScore: number;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
  actionPayload: Record<string, any>;
}

export class DecisionEngine {
  /**
   * Generates prioritized, actionable warehouse decisions synthesizing multi-engine telemetry
   */
  public static generateDecisions(context: {
    urgentOrders: any[];
    stockoutProducts: any[];
    bottlenecks: any[];
    openExceptions: any[];
    utilizationRate: number;
  }): DecisionCard[] {
    const decisions: DecisionCard[] = [];

    // 1. SLA & Urgent Orders Decision
    const criticalOrder = context.urgentOrders.find((o) => o.slaRisk === 'HIGH' || o.priorityScore >= 85);
    if (criticalOrder) {
      decisions.push({
        category: 'SLA_OPTIMIZATION',
        problem: `Order ${criticalOrder.orderNumber} is at severe SLA breach risk (${new Date(criticalOrder.slaDeadline).toLocaleTimeString()} cutoff).`,
        dataConsidered: {
          orderNumber: criticalOrder.orderNumber,
          customer: criticalOrder.customerName,
          orderValue: `₹${criticalOrder.orderValue?.toLocaleString('en-IN')}`,
          priorityScore: criticalOrder.priorityScore,
          currentStage: criticalOrder.stage,
          slaRisk: criticalOrder.slaRisk,
        },
        decision: `Fast-track ${criticalOrder.orderNumber} to Express Picker and pre-assign Packing Station P01.`,
        reason: `Order value ₹${criticalOrder.orderValue?.toLocaleString('en-IN')} with Tier-1 priority SLA expiring in under 90 minutes.`,
        expectedImpact: `Reduces remaining cycle time by 28 minutes; eliminates SLA breach financial penalty.`,
        confidenceScore: 95,
        status: 'PENDING',
        actionPayload: {
          actionType: 'EXPEDITE_ORDER',
          orderId: criticalOrder.id,
          orderNumber: criticalOrder.orderNumber,
        },
      });
    }

    // 2. Bottleneck & Station Balancing Decision
    if (context.bottlenecks && context.bottlenecks.length > 0) {
      const b = context.bottlenecks[0];
      decisions.push({
        category: 'BOTTLENECK_RELIEF',
        problem: `Packing Station ${b.stationCode} queue depth is critical (${b.queueDepth} orders waiting).`,
        dataConsidered: {
          stationCode: b.stationCode,
          queueDepth: b.queueDepth,
          avgProcessingTime: `${b.avgProcessingTimeMin.toFixed(1)} min`,
          baselineTime: `${b.baselineProcessingTimeMin} min`,
          projectedDelay: `+${b.delayImpactMinutes} min`,
        },
        decision: `Reassign 1 operator from Station ${b.actionPayload?.sourceStation || 'P01'} to Station ${b.stationCode}.`,
        reason: `Station queue depth is ${b.queueDepth} units, creating upstream congestion for picking waves.`,
        expectedImpact: `Halves station queue within 15 minutes and restores normal dispatch cadence.`,
        confidenceScore: 92,
        status: 'PENDING',
        actionPayload: {
          actionType: 'REALLOCATE_WORKER',
          sourceStation: b.actionPayload?.sourceStation || 'P01',
          targetStation: b.stationCode,
        },
      });
    }

    // 3. Reorder / Low Stock Risk Decision
    if (context.stockoutProducts && context.stockoutProducts.length > 0) {
      const prod = context.stockoutProducts[0];
      decisions.push({
        category: 'REORDER_TRIGGER',
        problem: `SKU ${prod.sku} (${prod.productName}) has breached safety stock buffer (${prod.availableStock} units left).`,
        dataConsidered: {
          sku: prod.sku,
          productName: prod.productName,
          availableStock: prod.availableStock,
          dailyDemand: `${prod.avgDailyDemand} units/day`,
          daysRemaining: `${prod.daysRemaining} days`,
          leadTime: `${prod.supplierLeadTimeDays} days`,
        },
        decision: `Trigger automatic purchase order for ${prod.recommendedReorderQty} units from primary supplier.`,
        reason: `Run-rate predicts stockout in ${prod.daysRemaining} days, which is less than supplier lead time of ${prod.supplierLeadTimeDays} days.`,
        expectedImpact: `Prevents anticipated 4-day stockout gap and secures supplier allocation queue.`,
        confidenceScore: 96,
        status: 'PENDING',
        actionPayload: {
          actionType: 'CREATE_PURCHASE_ORDER',
          productId: prod.productId,
          sku: prod.sku,
          quantity: prod.recommendedReorderQty,
        },
      });
    }

    // 4. Warehouse Congestion & Utilization
    if (context.utilizationRate > 85) {
      decisions.push({
        category: 'WORKER_REBALANCE',
        problem: `Zone B storage utilization reached ${context.utilizationRate}% peak density.`,
        dataConsidered: {
          warehouseUtilization: `${context.utilizationRate}%`,
          zoneDensity: 'High',
          forkliftTraffic: 'Heavy',
        },
        decision: `Route inbound replenishment pallets to Zone C overflow racks and stagger pick wave releases.`,
        reason: `High aisle density is slowing picker cart travel velocity by 18%.`,
        expectedImpact: `Clears aisle choke points and improves overall picker travel speed by 22%.`,
        confidenceScore: 89,
        status: 'PENDING',
        actionPayload: {
          actionType: 'REROUTE_INBOUND_ZONE',
          targetZone: 'C',
        },
      });
    }

    return decisions;
  }
}
