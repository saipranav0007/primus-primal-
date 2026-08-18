import React from 'react';
import { X, Bell, Check, AlertTriangle, AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Notification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead } = useWarehouse();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'RECOMMENDATION':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D1424] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Live Warehouse Notifications</h3>
                <p className="text-[11px] text-slate-400">Real-time alerts streamed via Socket.IO</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => markNotificationAsRead('all')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded bg-cyan-950/40 border border-cyan-900"
              >
                Mark all read
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Check className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No active notifications</p>
              </div>
            ) : (
              notifications.map((notif: Notification) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-md hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-semibold ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                        <span className="uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {notif.category}
                        </span>
                        <span>{new Date(notif.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
