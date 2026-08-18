import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WarehouseProvider } from './context/WarehouseContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LiveEventBanner } from './components/ui/LiveEventBanner';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { LiveWarehousePage } from './pages/LiveWarehousePage';
import { InventoryPage } from './pages/InventoryPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { AllocationPage } from './pages/AllocationPage';
import { PickingPackingPage } from './pages/PickingPackingPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { DispatchPage } from './pages/DispatchPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DecisionCenterPage } from './pages/DecisionCenterPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default logged in for hackathon demo

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <WarehouseProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-[#080C14] text-slate-100 antialiased font-sans">
          {/* Left Navigation Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Bar */}
            <Navbar />

            {/* Page Router Outlet */}
            <main className="flex-1 overflow-y-auto bg-[#080C14]/90 pb-12">
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/live-warehouse" element={<LiveWarehousePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/allocation" element={<AllocationPage />} />
                <Route path="/picking-packing" element={<PickingPackingPage />} />
                <Route path="/exceptions" element={<ExceptionsPage />} />
                <Route path="/dispatch" element={<DispatchPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/decision-center" element={<DecisionCenterPage />} />
                <Route path="/command-center" element={<CommandCenterPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Real-time Socket.IO Floating Event Banner */}
          <LiveEventBanner />
        </div>
      </BrowserRouter>
    </WarehouseProvider>
  );
};

export default App;
