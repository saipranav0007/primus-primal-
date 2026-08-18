export interface ReorderPrediction {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  avgDailyDemand: number;
  daysRemaining: number;
  reorderPoint: number;
  safetyStock: number;
  supplierLeadTimeDays: number;
  recommendedReorderQty: number;
  estimatedCost: number;
  riskLevel: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
  recommendationReason: string;
}

export class ReorderEngine {
  /**
   * Evaluates predictive stockout timing and generates supplier purchase order recommendations
   */
  public static evaluateProductStock(product: {
    id: string;
    sku: string;
    name: string;
    category: string;
    cost: number;
    reorderPoint: number;
    safetyStock: number;
    leadTimeDays: number;
    avgDailyDemand: number;
    inventories: { quantity: number; reserved: number; available: number }[];
  }): ReorderPrediction {
    const totalQty = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = product.inventories.reduce((sum, inv) => sum + inv.reserved, 0);
    const totalAvailable = Math.max(0, totalQty - totalReserved);

    const demand = Math.max(0.5, product.avgDailyDemand || 5.0);
    const daysRemaining = totalAvailable / demand;
    const leadTime = product.leadTimeDays || 5;
    const safetyStock = product.safetyStock || 10;
    const reorderPoint = product.reorderPoint || 20;

    // Calculate recommended order quantity (EOQ / Target Stock Model)
    // Target stock = (LeadTime + 14 Days Buffer) * Demand + SafetyStock
    const targetStock = Math.ceil((leadTime + 14) * demand + safetyStock);
    const recommendedQty = Math.max(0, targetStock - totalAvailable);

    let riskLevel: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK' = 'HEALTHY';
    let recommendationReason = 'Stock levels are balanced and sufficient for regular fulfillment cycle.';

    if (totalAvailable === 0) {
      riskLevel = 'OUT_OF_STOCK';
      recommendationReason = `Stock depleted! Immediate emergency replenishment of ${recommendedQty} units required to restore safety buffer.`;
    } else if (daysRemaining <= leadTime) {
      riskLevel = 'CRITICAL';
      recommendationReason = `Stockout predicted in ${daysRemaining.toFixed(1)} days (less than ${leadTime}-day supplier lead time). Reorder ${recommendedQty} units immediately!`;
    } else if (totalAvailable <= reorderPoint || daysRemaining <= leadTime * 1.5) {
      riskLevel = 'LOW';
      recommendationReason = `Available stock (${totalAvailable}) breached reorder point (${reorderPoint}). Order ${recommendedQty} units to prevent stock depletion.`;
    }

    return {
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      category: product.category,
      currentStock: totalQty,
      reservedStock: totalReserved,
      availableStock: totalAvailable,
      avgDailyDemand: demand,
      daysRemaining: parseFloat(daysRemaining.toFixed(1)),
      reorderPoint,
      safetyStock,
      supplierLeadTimeDays: leadTime,
      recommendedReorderQty: recommendedQty,
      estimatedCost: recommendedQty * product.cost,
      riskLevel,
      recommendationReason,
    };
  }
}
