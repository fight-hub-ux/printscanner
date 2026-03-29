'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function NotificationDrawer() {
  const { notifications, showNotifications, setShowNotifications, markAllRead, unreadCount } = useApp();

  if (!showNotifications) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
      <div className="fixed right-0 top-16 w-96 max-w-[90vw] bg-miau-dark-card border-l border-miau-dark-border shadow-2xl z-50 h-[calc(100vh-4rem)] overflow-y-auto animate-fade-in-up">
        <div className="p-4 border-b border-miau-dark-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-miau-white">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-miau-pink hover:text-miau-pink-soft font-semibold"
              >
                Mark all read
              </button>
            )}
            <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-miau-dark-hover rounded-lg">
              <X size={18} className="text-miau-muted" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-miau-dark-border">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 ${!n.read ? 'bg-miau-dark-surface/50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  n.type === 'success' ? 'bg-miau-success' :
                  n.type === 'info' ? 'bg-blue-400' :
                  'bg-miau-warning'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-miau-light">{n.message}</p>
                  <p className="text-xs text-miau-muted mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
