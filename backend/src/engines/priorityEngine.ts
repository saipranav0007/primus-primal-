export interface PriorityBreakdown {
  slaUrgency: number;
  shippingUrgency: number;
  customerPriority: number;
  orderAge: number;
  inventoryRisk: number;
  totalScore: number;
  factors: { name: string; impact: number; reason: string }[];
}

export class PriorityEngine {
  /**
   * Calculates a dynamic priority score (0-100) and structured explanation for an order
   */
  public static calculatePriority(order: {
    slaDeadline: Date | string;
    shippingType: string;
    orderValue: number;
    createdAt: Date | string;
    customerName?: string;
    inventoryAvailable?: boolean;
  }): PriorityBreakdown {
    const now = new Date().getTime();
    const deadline = new Date(order.slaDeadline).getTime();
    const created = new Date(order.createdAt).getTime();

    const hoursUntilSla = (deadline - now) / (1000 * 60 * 60);
    const ageHours = (now - created) / (1000 * 60 * 60);

    const factors: { name: string; impact: number; reason: string }[] = [];

    // 1. SLA Urgency Factor (0 - 35 points)
    let slaPoints = 0;
    if (hoursUntilSla <= 1.5) {
      slaPoints = 35;
      factors.push({ name: 'Critical SLA Window', impact: 35, reason: `Less than ${Math.max(0.1, hoursUntilSla).toFixed(1)}h remaining before SLA breach` });
    } else if (hoursUntilSla <= 4) {
      slaPoints = 25;
      factors.push({ name: 'Tight SLA Deadline', impact: 25, reason: `${hoursUntilSla.toFixed(1)}h until fulfillment SLA limit` });
    } else if (hoursUntilSla <= 8) {
      slaPoints = 15;
      factors.push({ name: 'Approaching SLA', impact: 15, reason: `${hoursUntilSla.toFixed(1)}h until SLA cutoff` });
    } else {
      slaPoints = 5;
      factors.push({ name: 'Normal SLA Window', impact: 5, reason: `${hoursUntilSla.toFixed(1)}h safe fulfillment buffer` });
    }

    // 2. Shipping Urgency Factor (0 - 25 points)
    let shippingPoints = 0;
    const shipping = (order.shippingType || '').toUpperCase();
    if (shipping === 'SAME_DAY_PRIORITY' || shipping === 'EXPRESS_SAME_DAY') {
      shippingPoints = 25;
      factors.push({ name: 'Same-Day Express Dispatch', impact: 25, reason: 'Carrier priority slot booked' });
    } else if (shipping === 'EXPRESS') {
      shippingPoints = 20;
      factors.push({ name: 'Express Air Shipping', impact: 20, reason: 'Next-day delivery tier' });
    } else {
      shippingPoints = 8;
      factors.push({ name: 'Standard Surface Shipping', impact: 8, reason: 'Standard transit timeframe' });
    }

    // 3. Customer & Value Tier (0 - 20 points)
    let customerPoints = 0;
    if (order.orderValue >= 25000) {
      customerPoints = 20;
      factors.push({ name: 'High-Value Enterprise Basket', impact: 20, reason: `Order value ₹${order.orderValue.toLocaleString('en-IN')}` });
    } else if (order.orderValue >= 10000) {
      customerPoints = 15;
      factors.push({ name: 'Tier-1 Customer Order', impact: 15, reason: `Order value ₹${order.orderValue.toLocaleString('en-IN')}` });
    } else {
      customerPoints = 8;
      factors.push({ name: 'Standard Retail Order', impact: 8, reason: `Order value ₹${order.orderValue.toLocaleString('en-IN')}` });
    }

    // 4. Order Age & Queue Dwell (0 - 15 points)
    let agePoints = 0;
    if (ageHours > 6) {
      agePoints = 15;
      factors.push({ name: 'Extended Queue Dwell', impact: 15, reason: `Order placed ${ageHours.toFixed(1)}h ago` });
    } else if (ageHours > 2) {
      agePoints = 10;
      factors.push({ name: 'Active Queue Time', impact: 10, reason: `Order placed ${ageHours.toFixed(1)}h ago` });
    } else {
      agePoints = 4;
      factors.push({ name: 'Recent Order Ingestion', impact: 4, reason: `Ingested ${ageHours.toFixed(1)}h ago` });
    }

    // 5. Inventory Risk Factor (0 - 15 points)
    let inventoryRiskPoints = 0;
    if (order.inventoryAvailable === false) {
      inventoryRiskPoints = 15;
      factors.push({ name: 'Stock Contention Risk', impact: 15, reason: 'Multi-order competition for limited SKU inventory' });
    } else {
      inventoryRiskPoints = 5;
      factors.push({ name: 'Inventory Allocated', impact: 5, reason: 'Sufficient batch units reserved' });
    }

    const rawScore = slaPoints + shippingPoints + customerPoints + agePoints + inventoryRiskPoints;
    const totalScore = Math.min(100, Math.max(0, rawScore));

    return {
      slaUrgency: slaPoints,
      shippingUrgency: shippingPoints,
      customerPriority: customerPoints,
      orderAge: agePoints,
      inventoryRisk: inventoryRiskPoints,
      totalScore,
      factors,
    };
  }

  /**
   * Determine SLA Risk level based on remaining time and progress
   */
  public static calculateSlaRisk(deadline: Date | string, stage: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'BREACHED' {
    if (stage === 'DISPATCHED') return 'LOW';
    const now = new Date().getTime();
    const target = new Date(deadline).getTime();
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0) return 'BREACHED';
    if (diffHours <= 1.5) return 'HIGH';
    if (diffHours <= 4.0) return 'MEDIUM';
    return 'LOW';
  }
}
