import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { DashboardData, Notification, Exception } from '../types';

interface WarehouseContextType {
  dashboard: DashboardData | null;
  loading: boolean;
  activeWarehouseId: string;
  setActiveWarehouseId: (id: string) => void;
  notifications: Notification[];
  unreadNotificationCount: number;
  activeExceptions: Exception[];
  selectedRackId: string | null;
  setSelectedRackId: (id: string | null) => void;
  lastLiveEvent: { type: string; payload: any; timestamp: string } | null;
  refreshDashboard: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  runDemoScenario: (type: string) => Promise<any>;
  resetDemoState: () => Promise<void>;
  isConnected: boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWarehouseId, setActiveWarehouseId] = useState('wh-a');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeExceptions, setActiveExceptions] = useState<Exception[]>([]);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [lastLiveEvent, setLastLiveEvent] = useState<{ type: string; payload: any; timestamp: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [dashRes, notifRes, excRes] = await Promise.all([
        api.getDashboard(),
        api.getNotifications(),
        api.getExceptions({ status: 'OPEN' }),
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (notifRes.success) setNotifications(notifRes.data);
      if (excRes.success) setActiveExceptions(excRes.data);
    } catch (err) {
      console.error('Error fetching warehouse data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = async () => {
    try {
      const res = await api.getDashboard();
      if (res.success) setDashboard(res.data);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        id === 'all'
          ? prev.map((n) => ({ ...n, read: true }))
          : prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const runDemoScenario = async (type: string) => {
    const res = await api.triggerScenario(type);
    await refreshDashboard();
    return res;
  };

  const resetDemoState = async () => {
    await api.resetDemo();
    await fetchInitialData();
  };

  // Socket.IO event listeners
  useEffect(() => {
    fetchInitialData();
    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    if (socket.connected) setIsConnected(true);

    const events = [
      'order.created',
      'order.priority.changed',
      'order.stage.changed',
      'inventory.updated',
      'allocation.approved',
      'picking.started',
      'picking.progress',
      'packing.rebalanced',
      'qc.completed',
      'exception.created',
      'exception.resolved',
      'shipment.dispatched',
      'bottleneck.detected',
      'decision.executed',
      'demo.scenario.started',
      'demo.reset',
    ];

    events.forEach((eventName) => {
      socket.on(eventName, (data) => {
        console.log(`⚡ [Live Event]: ${eventName}`, data);
        setLastLiveEvent({
          type: eventName,
          payload: data,
          timestamp: new Date().toLocaleTimeString(),
        });
        refreshDashboard();

        // If an exception was created, prepend to active exceptions
        if (eventName === 'exception.created' && data.exception) {
          setActiveExceptions((prev) => [data.exception, ...prev]);
        }
        if (eventName === 'exception.resolved' && data.exception) {
          setActiveExceptions((prev) => prev.filter((e) => e.id !== data.exception.id));
        }
      });
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      events.forEach((ev) => socket.off(ev));
    };
  }, [fetchInitialData]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <WarehouseContext.Provider
      value={{
        dashboard,
        loading,
        activeWarehouseId,
        setActiveWarehouseId,
        notifications,
        unreadNotificationCount,
        activeExceptions,
        selectedRackId,
        setSelectedRackId,
        lastLiveEvent,
        refreshDashboard,
        markNotificationAsRead,
        runDemoScenario,
        resetDemoState,
        isConnected,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
