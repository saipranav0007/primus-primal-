export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  image: string;
  rating: number;
  supplier: string;
  reorderPoint: number;
  safetyStock: number;
  leadTimeDays: number;
  avgDailyDemand: number;
  weightKg?: number;
  dimensions?: string;
  totalQuantity?: number;
  totalReserved?: number;
  totalAvailable?: number;
  stockStatus?: string;
  inventories?: Inventory[];
}

export interface Inventory {
  id: string;
  productId: string;
  product: Product;
  locationId: string;
  location?: StorageLocation;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reserved: number;
  available: number;
  status: 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK' | 'OVERSTOCK';
  batchNumber?: string;
  stockValue?: number;
  reorderPrediction?: ReorderPrediction;
  updatedAt: string;
}

export interface StorageLocation {
  id: string;
  rackId: string;
  rack?: Rack;
  binCode: string;
  level: number;
  bay: number;
  maxCapacity: number;
  currentCapacity: number;
  posX: number;
  posY: number;
  posZ: number;
}

export interface Rack {
  id: string;
  zoneId: string;
  zone?: Zone;
  code: string;
  posX: number;
  posY: number;
  posZ: number;
  width: number;
  height: number;
  depth: number;
  levels: number;
  bays: number;
  status: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK' | 'ACTIVE_PICKING';
  totalUnits?: number;
  totalReserved?: number;
  totalAvailable?: number;
  products?: {
    sku: string;
    name: string;
    category: string;
    quantity: number;
    available: number;
    price: number;
  }[];
}

export interface Zone {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  capacity: number;
  racks: Rack[];
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  requestedQty: number;
  allocatedQty: number;
  pickedQty: number;
  packedQty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerCity: string;
  orderValue: number;
  shippingType: 'STANDARD' | 'EXPRESS' | 'SAME_DAY_PRIORITY';
  priorityScore: number;
  priorityExplanation?: string;
  priorityExplanationParsed?: {
    slaUrgency: number;
    shippingUrgency: number;
    customerPriority: number;
    orderAge: number;
    inventoryRisk: number;
    totalScore: number;
    factors: { name: string; impact: number; reason: string }[];
  };
  priorityOverride: boolean;
  priorityOverrideReason?: string;
  stage: 'CREATED' | 'PRIORITIZED' | 'ALLOCATED' | 'PICKING' | 'PACKING' | 'QC' | 'READY' | 'DISPATCHED';
  slaDeadline: string;
  slaRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'BREACHED';
  assignedPicker?: string;
  warehouseId: string;
  items: OrderItem[];
  allocations?: Allocation[];
  pickingTasks?: PickingTask[];
  qualityChecks?: QualityCheck[];
  shipments?: Shipment[];
  exceptions?: Exception[];
  createdAt: string;
  updatedAt: string;
}

export interface Allocation {
  id: string;
  orderId: string;
  order?: Order;
  strategy: 'FULL' | 'PARTIAL' | 'SPLIT' | 'CROSS_WAREHOUSE' | 'PRIORITY_RESERVATION' | 'BACKORDER';
  status: 'RECOMMENDED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  recommendedAction: string;
  reason: string;
  allocatedQty: number;
  remainingQty: number;
  expectedImpact: string;
  confidenceScore: number;
  affectedOrderIds?: string;
  createdAt: string;
}

export interface PickingTask {
  id: string;
  orderId: string;
  order?: Order;
  pickerName?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  priority: number;
  baselineDistanceM: number;
  optimizedDistanceM: number;
  savingsPercent: number;
  routeWaypoints?: string;
  routeData?: {
    baselineDistanceM: number;
    optimizedDistanceM: number;
    savingsMeters: number;
    savingsPercent: number;
    estimatedPickTimeMin: number;
    optimizedWaypoints: {
      step: number;
      rackCode: string;
      binCode: string;
      sku: string;
      productName: string;
      quantity: number;
      posX: number;
      posY: number;
      posZ: number;
      zone: string;
      action: string;
    }[];
    routePathCoordinates: [number, number, number][];
  };
  currentStep: number;
  totalSteps: number;
  startedAt?: string;
  completedAt?: string;
}

export interface PackingStation {
  id: string;
  stationCode: string;
  workerName: string;
  currentOrderNum?: string;
  queueDepth: number;
  avgPackingTimeMin: number;
  status: 'AVAILABLE' | 'PACKING' | 'WAITING' | 'MAINTENANCE' | 'OVERLOADED';
}

export interface QualityCheck {
  id: string;
  orderId: string;
  order?: Order;
  inspectorName: string;
  itemsVerified: boolean;
  damageFound: boolean;
  wrongSkuFound: boolean;
  notes?: string;
  passed: boolean;
  timestamp: string;
}

export interface Exception {
  id: string;
  exceptionNumber: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'ACTION_REQUIRED' | 'RESOLVED';
  orderId?: string;
  order?: Order;
  productId?: string;
  product?: Product;
  rackId?: string;
  rack?: Rack;
  stationCode?: string;
  description: string;
  impact: string;
  primalRecommendation: string;
  confidenceScore: number;
  resolutionNotes?: string;
  resolutionPlan?: {
    actionType: string;
    summary: string;
    steps: string[];
    expectedImpact: string;
    confidenceScore: number;
  };
  createdAt: string;
  resolvedAt?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  order?: Order;
  trackingNumber: string;
  carrier: string;
  destinationCity: string;
  status: 'READY' | 'DISPATCHING' | 'DISPATCHED' | 'DELAYED' | 'DELIVERED';
  dispatchTime?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS' | 'RECOMMENDATION';
  category: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  userName?: string;
  timestamp: string;
}

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

export interface DashboardData {
  warehouseStatus: 'OPERATIONAL' | 'WARNING' | 'CRITICAL';
  statusMessage: string;
  kpis: {
    totalInventoryValue: number;
    totalSKUs: number;
    ordersToday: number;
    pendingOrders: number;
    activeOrders: number;
    readyForDispatch: number;
    dispatchedOrders: number;
    lowStock: number;
    criticalStock: number;
    outOfStock: number;
    fulfillmentRate: number;
    avgPickTimeMin: number;
    warehouseUtilization: number;
    activeExceptions: number;
    criticalExceptions: number;
  };
  pipelineStages: {
    stage: string;
    label: string;
    count: number;
    color: string;
  }[];
  bottlenecks: any[];
  recentActivities: ActivityLog[];
  timestamp: string;
}
