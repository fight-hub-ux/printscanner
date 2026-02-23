'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OpenOrder, initialOpenOrders, initialNotifications, Notification } from '@/lib/dummyData';

interface AppContextType {
  // Wallet
  walletAddress: string;
  miauBalance: number;
  setMiauBalance: (balance: number) => void;
  stakedAmount: number;
  setStakedAmount: (amount: number) => void;
  stakingTier: 'None' | 'Bronze' | 'Silver' | 'Gold';
  feeDiscount: number;
  isVIP: boolean;
  hasCDEXAccess: boolean;

  // MIAU Price ticker
  miauPrice: number;

  // Orders
  openOrders: OpenOrder[];
  addOrder: (order: OpenOrder) => void;
  cancelOrder: (id: string) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;

  // Demo toggles
  showAccessWarning: boolean;
  setShowAccessWarning: (show: boolean) => void;

  // Toast
  toastMessage: string | null;
  showToast: (message: string) => void;

  // Selected CAT for trading
  selectedCreatorSlug: string;
  setSelectedCreatorSlug: (slug: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [miauBalance, setMiauBalance] = useState(4250);
  const [stakedAmount, setStakedAmount] = useState(50000);
  const [miauPrice, setMiauPrice] = useState(1.0);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>(initialOpenOrders);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccessWarning, setShowAccessWarning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCreatorSlug, setSelectedCreatorSlug] = useState('nella-rose');

  // Calculate staking tier
  const stakingTier = stakedAmount >= 250000 ? 'Gold' : stakedAmount >= 50000 ? 'Silver' : stakedAmount >= 10000 ? 'Bronze' : 'None';
  const feeDiscount = stakingTier === 'Gold' ? 20 : stakingTier === 'Silver' ? 10 : 0;
  const isVIP = stakedAmount >= 25000;
  const hasCDEXAccess = miauBalance >= 1000;

  // MIAU price ticker - fluctuate ±0.5% every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMiauPrice(prev => {
        const change = (Math.random() - 0.5) * 0.01;
        return Math.round((prev + change) * 1000) / 1000;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Show access warning when balance approaches threshold
  useEffect(() => {
    if (miauBalance < 1100 && miauBalance >= 1000) {
      setShowAccessWarning(true);
    }
  }, [miauBalance]);

  const addOrder = useCallback((order: OpenOrder) => {
    setOpenOrders(prev => [order, ...prev]);
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setOpenOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  return (
    <AppContext.Provider
      value={{
        walletAddress: '0x4f2a...8b3d',
        miauBalance,
        setMiauBalance,
        stakedAmount,
        setStakedAmount,
        stakingTier,
        feeDiscount,
        isVIP,
        hasCDEXAccess,
        miauPrice,
        openOrders,
        addOrder,
        cancelOrder,
        notifications,
        unreadCount,
        markAllRead,
        showNotifications,
        setShowNotifications,
        showAccessWarning,
        setShowAccessWarning,
        toastMessage,
        showToast,
        selectedCreatorSlug,
        setSelectedCreatorSlug,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-miau-brown text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-up">
          {toastMessage}
        </div>
      )}
      {showAccessWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-miau-warning/10 border-b border-miau-warning px-4 py-3 text-center">
          <span className="text-miau-warning font-medium text-sm">
            ⚠ Your MIAU balance is approaching the 1,000 MIAU access threshold. Top up to maintain trading access. You have a 1-hour grace period if balance falls below 1,000 MIAU.
          </span>
          <button onClick={() => setShowAccessWarning(false)} className="ml-4 text-miau-warning hover:text-miau-brown font-bold">×</button>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
