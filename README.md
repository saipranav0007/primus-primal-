# PRIMAL — Intelligent Warehouse Operations Platform

### **See. Decide. Fulfill.**

> An enterprise-grade intelligent warehouse command center that answers the continuous operational question: **"WHAT SHOULD THE WAREHOUSE DO NEXT?"**

```text
EXCEPTION → INTELLIGENCE → DECISION → ACTION → RESOLUTION
```

---

## 🌟 Executive Overview & Key Innovations

PRIMAL is not a traditional CRUD warehouse management system. It is an **active operations intelligence engine** designed for modern fulfillment centers handling high-velocity, SLA-critical orders.

### Core Capabilities:
1. **Deterministic AI Decision Center**: Continuously synthesizes telemetry across inventory, queues, and order deadlines into prioritized, high-impact operational recommendations with quantifiable confidence scores and expected impact.
2. **Intelligent Allocation Engine**: Multi-echelon inventory solver capable of executing Full, Partial, Split, Cross-Warehouse transfers (e.g., WH-A Bengaluru & WH-B Hyderabad), and Priority Reservations.
3. **Interactive 3D Digital Twin**: Real-time Three.js / React Three Fiber spatial visualization with dynamically colored racks, hover tooltips, and animated picker route simulation.
4. **Picking Route Optimizer (3D TSP)**: 3D coordinate traveling salesman solver achieving **~31% distance reduction** (e.g. 428m baseline reduced to 295m).
5. **Packing Station Congestion Balancer**: Detects bottlenecked stations (e.g. Station P03 backlogged with 17 orders) and dynamically rebalances workforce.
6. **Predictive Reorder Engine**: Calculates burn-rate, days-to-stockout, safety buffers, and supplier lead times to preempt stockouts.
7. **Incident & Exception Center**: Full lifecycle tracking for 10+ operational exception types with 1-click automated resolution.
8. **Real-Time WebSocket Synchronization**: Socket.IO bi-directional streaming for instant multi-client state updates without page refreshes.

---

## 🏗️ Architecture & Component Topology

```text
                 ┌──────────────────────────────────────────────┐
                 │              PRIMAL FRONTEND                 │
                 │   React + Vite + TypeScript + Tailwind CSS   │
                 │  React Three Fiber (3D) + Recharts + Lucide  │
                 └──────────────────────┬───────────────────────┘
                                        │
                         HTTP REST API / Socket.IO WebSockets
                                        │
                 ┌──────────────────────▼───────────────────────┐
                 │               PRIMAL BACKEND                 │
                 │       Node.js + Express + TypeScript         │
                 │         Socket.IO Real-time Hub              │
                 └──────────────────────┬───────────────────────┘
                                        │
          ┌───────────────────────┬─────┴───────────────┬─────────────────────┐
          │                       │                     │                     │
          ▼                       ▼                     ▼                     ▼
   Priority Engine        Allocation Engine       Reorder Engine        Picking Engine
 (0-100 SLA Scorer)     (Split/Cross-WH/Resv)  (Stockout Predictor)  (3D TSP Optimizer)
          │                       │                     │                     │
          ├───────────────────────┴─────────────────────┴─────────────────────┤
          │                                                                   │
          ▼                                                                   ▼
   Bottleneck Engine                                                   Exception Engine
(Station Queue Balancer)                                             (Incident Resolver)
          │                                                                   │
          └───────────────────────────────┬───────────────────────────────────┘
                                          │
                                    ┌─────▼─────┐
                                    │  Prisma   │
                                    │  SQLite   │
                                    └───────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Tested on Node v24)
- **npm**: v9+

### 1. Installation
Run from the project root:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Database Migration & Seeding
Populate the database with 50+ products (Indian ₹ pricing), 100+ inventory bins, 40+ orders, 20+ racks with 3D coordinates, packing stations, and exceptions:
```bash
npm run seed
```

### 3. Launch Development Servers
Start both backend (Port 5000) and frontend (Port 5173) concurrently:
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api`
- **Backend Health Check**: `http://localhost:5000/health`

---

## 🏆 Hackathon 3-Minute Demo Flow

1. **Step 1 — Overview**: Open Dashboard (`http://localhost:5173`). Observe the dynamic **Warehouse Status**, 12 animated KPI cards (Inventory Value in Lakhs, Fulfillment Rate, Avg Pick Time), and the Live Order Pipeline.
2. **Step 2 — Interactive 3D Digital Twin**: Navigate to **Live Warehouse**. Explore the 3D warehouse layout with colored racks (Green, Amber, Orange, Red, Cyan). Click on **Rack A01** to inspect stored SKUs. Toggle the **3D Picker Simulation** to watch picker *Aarav Sharma* navigate waypoints.
3. **Step 3 — Intelligent Allocation Engine**: Navigate to **Allocation Engine**. Select order `ORD-1048`. Observe the multi-warehouse split strategy recommendation (*"Allocate 7 units from WH-A Rack A12 and 3 units from WH-B Rack C09"*). Click **[APPLY RECOMMENDATION]** and observe instant inventory reservation.
4. **Step 4 — Route Optimization & Packing Load Balancer**: Navigate to **Picking & Packing**. Show the TSP optimizer reducing travel distance from 428m to 295m (**31% savings**). Show **Packing Station P03** in an overloaded state (17 orders) and click **[Rebalance Worker]** to clear the bottleneck.
5. **Step 5 — AI Decision Center & Command Center**: Navigate to **Command Center**. Click **[Start Live Demo Flow]** to trigger the automated 6-step lifecycle:
   $$\text{DETECT} \to \text{ANALYZE} \to \text{RECOMMEND} \to \text{DECISION} \to \text{EXECUTE} \to \text{RESOLVE}$$

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Aggregated KPIs and dynamic warehouse operational status |
| `GET` | `/api/products` | 50+ product catalog with stock status |
| `GET` | `/api/inventory` | Real-time stock levels, bin locations, and ₹ valuation |
| `GET` | `/api/inventory/reorder-predictions` | Predictive run-rate & supplier PO recommendations |
| `GET` | `/api/orders` | Multi-stage orders with SLA countdowns |
| `POST` | `/api/orders/:id/prioritize` | Priority recalculation or manager override |
| `POST` | `/api/orders/:id/advance` | Advances order stage with automatic task generation |
| `GET` | `/api/allocations/evaluate/:orderId` | Evaluates multi-warehouse split allocation strategy |
| `POST` | `/api/allocations/:id/approve` | Approves allocation and reserves bin stock |
| `GET` | `/api/picking/tasks` | Picking waves with 3D TSP route coordinates |
| `POST` | `/api/packing/reallocate` | Rebalances packing station workforce |
| `GET` | `/api/exceptions` | 10+ exception types with resolution intelligence |
| `POST` | `/api/exceptions/:id/resolve` | One-click exception resolution workflow |
| `GET` | `/api/decisions` | Deterministic AI recommendations answering "What next?" |
| `POST` | `/api/decisions/execute` | One-click operational decision execution |
| `GET` | `/api/warehouse/spatial` | 3D mesh coordinates and dynamic rack health |
| `POST` | `/api/demo/scenario` | Injects live scenarios (Urgent Order, Stockout, Congestion) |
| `POST` | `/api/demo/reset` | Resets database to clean initial seed state |

---

## 🔐 Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CLIENT_URL="http://localhost:5173"
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

---

## 🛡️ License
Built for the Intelligent Warehouse Operations Hackathon. MIT License.
