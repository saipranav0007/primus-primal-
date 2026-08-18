import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { getProducts, getProductById, createProduct } from '../controllers/productController';
import { getInventory, getInventoryById, updateInventory, getReorderPredictions } from '../controllers/inventoryController';
import { getOrders, getOrderById, createOrder, prioritizeOrder, advanceOrderStage } from '../controllers/orderController';
import { getAllocations, evaluateOrderAllocation, approveAllocation, rejectAllocation } from '../controllers/allocationController';
import { getPickingTasks, optimizeTaskRoute, updateTaskProgress } from '../controllers/pickingController';
import { getPackingStations, reallocateWorker } from '../controllers/packingController';
import { getQualityChecks, submitQualityCheck } from '../controllers/qcController';
import { getExceptions, createException, resolveException } from '../controllers/exceptionController';
import { getShipments, updateShipmentStatus } from '../controllers/dispatchController';
import { getAnalyticsData } from '../controllers/analyticsController';
import { getDecisions, executeDecision } from '../controllers/decisionController';
import { triggerDemoScenario, resetDemoData } from '../controllers/demoController';
import { globalSearch } from '../controllers/searchController';
import { getWarehouseSpatialLayout } from '../controllers/warehouseController';
import { getNotifications, markNotificationRead, getActivityLogs } from '../controllers/notificationController';

const router = Router();

// 1. Dashboard & Status
router.get('/dashboard', getDashboardMetrics);

// 2. Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);

// 3. Inventory
router.get('/inventory', getInventory);
router.get('/inventory/reorder-predictions', getReorderPredictions);
router.get('/inventory/:id', getInventoryById);
router.patch('/inventory/:id', updateInventory);

// 4. Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.post('/orders/:id/prioritize', prioritizeOrder);
router.post('/orders/:id/advance', advanceOrderStage);

// 5. Allocation Engine
router.get('/allocations', getAllocations);
router.get('/allocations/evaluate/:orderId', evaluateOrderAllocation);
router.post('/allocations/:id/approve', approveAllocation);
router.post('/allocations/:id/reject', rejectAllocation);

// 6. Picking & Packing
router.get('/picking/tasks', getPickingTasks);
router.post('/picking/tasks/:id/optimize', optimizeTaskRoute);
router.post('/picking/tasks/:id/progress', updateTaskProgress);

router.get('/packing/stations', getPackingStations);
router.post('/packing/reallocate', reallocateWorker);

// 7. QC
router.get('/qc', getQualityChecks);
router.post('/qc', submitQualityCheck);

// 8. Exceptions
router.get('/exceptions', getExceptions);
router.post('/exceptions', createException);
router.post('/exceptions/:id/resolve', resolveException);

// 9. Dispatch & Shipments
router.get('/dispatch', getShipments);
router.post('/dispatch/:id/update', updateShipmentStatus);

// 10. Analytics
router.get('/analytics', getAnalyticsData);

// 11. AI Decision Center
router.get('/decisions', getDecisions);
router.post('/decisions/execute', executeDecision);

// 12. Spatial 3D Warehouse
router.get('/warehouse/spatial', getWarehouseSpatialLayout);

// 13. Search & Notifications
router.get('/search', globalSearch);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.get('/activity-logs', getActivityLogs);

// 14. Demo Scenarios & Reset
router.post('/demo/scenario', triggerDemoScenario);
router.post('/demo/reset', resetDemoData);

export default router;
