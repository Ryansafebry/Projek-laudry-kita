import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/utils/localStorage';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addOrderNotification: (orderId: string, status: 'new' | 'processing' | 'completed' | 'picked_up', customerName?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load notifications from localStorage or use default
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = loadFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    if (savedNotifications.length > 0) {
      // Convert timestamp strings back to Date objects
      return savedNotifications.map(notif => ({
        ...notif,
        timestamp: new Date(notif.timestamp)
      }));
    }
    return [];
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  // Clear notifications on logout
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.type === 'error' ? 'destructive' : 'default',
    });

    // Browser notification (if permission granted)
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Auto-clear old notifications after 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
      setNotifications(prev => 
        prev.filter(notification => notification.timestamp.getTime() > oneDayAgo)
      );
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Order status notifications
  const addOrderNotification = (orderId: string, status: 'new' | 'processing' | 'completed' | 'picked_up', customerName?: string) => {
    const notifications = {
      new: {
        title: '🆕 Pesanan Baru',
        message: `Pesanan ${orderId} dari ${customerName || 'pelanggan'} telah diterima dan menunggu konfirmasi`,
        type: 'info' as const,
        action: {
          label: 'Lihat Pesanan',
          onClick: () => window.location.href = `/orders/${orderId}`
        }
      },
      processing: {
        title: '⚡ Sedang Diproses',
        message: `Pesanan ${orderId} sedang dalam proses pencucian`,
        type: 'info' as const,
        action: {
          label: 'Lihat Status',
          onClick: () => window.location.href = `/orders/${orderId}`
        }
      },
      completed: {
        title: '✅ Pesanan Selesai',
        message: `Pesanan ${orderId} telah selesai dan siap untuk diambil`,
        type: 'success' as const,
        action: {
          label: 'Hubungi Pelanggan',
          onClick: () => window.location.href = `/orders/${orderId}`
        }
      },
      picked_up: {
        title: '📦 Pesanan Diambil',
        message: `Pesanan ${orderId} telah diambil oleh ${customerName || 'pelanggan'}`,
        type: 'success' as const,
        action: {
          label: 'Lihat Detail',
          onClick: () => window.location.href = `/orders/${orderId}`
        }
      }
    };

    addNotification(notifications[status]);
  };

  // Remove auto-simulation - notifications will only be triggered by real order changes

  // Expose addOrderNotification for external use
  useEffect(() => {
    (window as any).addOrderNotification = addOrderNotification;
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      addOrderNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};