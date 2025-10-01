import { useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useOrders } from '@/context/OrderContext';

export const useOrderNotifications = () => {
  const { addOrderNotification } = useNotifications();
  const { orders } = useOrders();

  useEffect(() => {
    // Listen for order status changes
    const handleOrderStatusChange = (orderId: string, newStatus: string, customerName: string) => {
      switch (newStatus.toLowerCase()) {
        case 'pending':
        case 'baru':
          addOrderNotification(orderId, 'new', customerName);
          break;
        case 'processing':
        case 'diproses':
        case 'sedang diproses':
          addOrderNotification(orderId, 'processing', customerName);
          break;
        case 'completed':
        case 'selesai':
        case 'ready':
        case 'siap':
          addOrderNotification(orderId, 'completed', customerName);
          break;
        case 'picked_up':
        case 'diambil':
        case 'delivered':
          addOrderNotification(orderId, 'picked_up', customerName);
          break;
        default:
          break;
      }
    };

    // Expose function globally for order updates
    (window as any).triggerOrderNotification = handleOrderStatusChange;

    return () => {
      delete (window as any).triggerOrderNotification;
    };
  }, [addOrderNotification]);

  // Notifications will only be triggered by real order status changes

  return {
    triggerOrderNotification: (orderId: string, status: string, customerName: string) => {
      const statusMap: { [key: string]: 'new' | 'processing' | 'completed' | 'picked_up' } = {
        'pending': 'new',
        'baru': 'new',
        'processing': 'processing',
        'diproses': 'processing',
        'sedang diproses': 'processing',
        'completed': 'completed',
        'selesai': 'completed',
        'ready': 'completed',
        'siap': 'completed',
        'picked_up': 'picked_up',
        'diambil': 'picked_up',
        'delivered': 'picked_up'
      };

      const mappedStatus = statusMap[status.toLowerCase()];
      if (mappedStatus) {
        addOrderNotification(orderId, mappedStatus, customerName);
      }
    }
  };
};
