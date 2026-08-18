const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function toQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      searchParams.append(key, String(value));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errData.error || `HTTP error ${res.status}`);
  }

  const json = await res.json();
  return json;
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJson<{ success: boolean; data: any }>('/dashboard'),

  // Products
  getProducts: (params?: { category?: string; search?: string; stockStatus?: string }) => {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/products${toQueryString(params)}`);
  },
  getProductById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/products/${id}`),

  // Inventory
  getInventory: (params?: { status?: string; category?: string; search?: string; warehouseId?: string }) => {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/inventory${toQueryString(params)}`);
  },
  getInventoryById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/inventory/${id}`),
  updateInventory: (id: string, body: any) =>
    fetchJson<{ success: boolean; data: any }>(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getReorderPredictions: () => fetchJson<{ success: boolean; count: number; data: any[] }>('/inventory/reorder-predictions'),

  // Orders
  getOrders: (params?: { stage?: string; priorityMin?: number; slaRisk?: string; search?: string }) => {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/orders${toQueryString(params)}`);
  },
  getOrderById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/orders/${id}`),
  createOrder: (body: any) =>
    fetchJson<{ success: boolean; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  prioritizeOrder: (id: string, body: any) =>
    fetchJson<{ success: boolean; data: any }>(`/orders/${id}/prioritize`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  advanceOrderStage: (id: string, body?: any) =>
    fetchJson<{ success: boolean; data: any }>(`/orders/${id}/advance`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  // Allocations
  getAllocations: (status?: string) =>
    fetchJson<{ success: boolean; count: number; data: any[] }>(`/allocations${toQueryString({ status })}`),
  evaluateAllocation: (orderId: string) => fetchJson<{ success: boolean; data: any }>(`/allocations/evaluate/${orderId}`),
  approveAllocation: (id: string, body?: any) =>
    fetchJson<{ success: boolean; data: any }>(`/allocations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  rejectAllocation: (id: string, reason?: string) =>
    fetchJson<{ success: boolean; data: any }>(`/allocations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Picking & Packing
  getPickingTasks: (status?: string) =>
    fetchJson<{ success: boolean; count: number; data: any[] }>(`/picking/tasks${toQueryString({ status })}`),
  optimizePickingTask: (id: string) =>
    fetchJson<{ success: boolean; data: any }>(`/picking/tasks/${id}/optimize`, {
      method: 'POST',
    }),
  progressPickingTask: (id: string, step?: number) =>
    fetchJson<{ success: boolean; data: any }>(`/picking/tasks/${id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ currentStep: step }),
    }),

  getPackingStations: () => fetchJson<{ success: boolean; data: any[]; bottlenecks: any[] }>('/packing/stations'),
  reallocateWorker: (sourceStationCode: string, targetStationCode: string) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/packing/reallocate', {
      method: 'POST',
      body: JSON.stringify({ sourceStationCode, targetStationCode }),
    }),

  // QC
  getQualityChecks: (status?: string) =>
    fetchJson<{ success: boolean; count: number; data: any[] }>(`/qc/checks${toQueryString({ status })}`),
  submitQualityCheck: (body: any) =>
    fetchJson<{ success: boolean; data: any }>('/qc/checks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Exceptions
  getExceptions: (params?: { severity?: string; status?: string; type?: string }) => {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/exceptions${toQueryString(params)}`);
  },
  getExceptionById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/exceptions/${id}`),
  createException: (body: any) =>
    fetchJson<{ success: boolean; data: any }>('/exceptions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  resolveException: (id: string, resolutionNotes: string) =>
    fetchJson<{ success: boolean; data: any }>(`/exceptions/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    }),

  // Dispatch & Shipments
  getShipments: (params?: { status?: string; carrier?: string }) => {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/dispatch/shipments${toQueryString(params)}`);
  },
  updateShipment: (id: string, body: any) =>
    fetchJson<{ success: boolean; data: any }>(`/dispatch/shipments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // Analytics
  getAnalytics: (period: string = '7d') =>
    fetchJson<{ success: boolean; data: any }>(`/analytics${toQueryString({ period })}`),

  // Decisions
  getDecisions: () => fetchJson<{ success: boolean; data: any[] }>('/decisions'),
  executeDecision: (actionPayload: any) =>
    fetchJson<{ success: boolean; data: any }>('/decisions/execute', {
      method: 'POST',
      body: JSON.stringify(actionPayload),
    }),

  // Warehouse Spatial Digital Twin
  getWarehouseSpatial: (warehouseId?: string) =>
    fetchJson<{ success: boolean; data: any }>(`/warehouse/spatial${toQueryString({ warehouseId })}`),

  // Demo Control
  triggerScenario: (scenarioType: string) =>
    fetchJson<{ success: boolean; data: any }>('/demo/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenarioType }),
    }),
  resetDemo: () => fetchJson<{ success: boolean; message: string }>('/demo/reset', { method: 'POST' }),

  // Global Search
  search: (q: string) => fetchJson<{ success: boolean; data: any }>(`/search${toQueryString({ q })}`),

  // Notifications
  getNotifications: () => fetchJson<{ success: boolean; data: any[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean; data: any }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
};
