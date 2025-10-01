import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { orders as mockOrders } from '@/data/mock';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/utils/localStorage';
import { getCurrentDateDDMMYYYY } from '@/utils/dateFormat';

// Define types for our data
interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

interface OrderItem {
  serviceId: number;
  name: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
}

interface PaymentHistory {
  date: string;
  amount: number;
  method: string;
  status: string;
}

export interface Order {
  id: string;
  customer: Customer;
  orderDate: string;
  status: string;
  items: OrderItem[];
  total: number;
  amountPaid: number;
  paymentHistory: PaymentHistory[];
}

interface OrderContextType {
  orders: Order[];
  addOrder: (newOrderData: Omit<Order, 'id' | 'orderDate' | 'status' | 'amountPaid' | 'paymentHistory'>) => void;
  updateOrderStatus: (orderId: string, newStatus: string) => void;
  addPayment: (orderId: string, amount: number, method: string) => void;
  resetOrders: () => void;
}
const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  // Load orders from localStorage or use mock data as fallback
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
    return savedOrders.length > 0 ? savedOrders : mockOrders;
  });

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  const addOrder = (newOrderData: Omit<Order, 'id' | 'orderDate' | 'status' | 'amountPaid' | 'paymentHistory'>) => {
    const newOrder: Order = {
      ...newOrderData,
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      orderDate: getCurrentDateDDMMYYYY(), // DD/MM/YYYY
      status: 'Baru',
      amountPaid: 0,
      paymentHistory: [],
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    // Trigger notification for new order
    if ((window as any).addOrderNotification) {
      (window as any).addOrderNotification(newOrder.id, 'new', newOrder.customer.name);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const addPayment = (orderId: string, amount: number, method: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const newPayment: PaymentHistory = {
            date: getCurrentDateDDMMYYYY(),
            amount,
            method,
            status: 'Lunas',
          };
          return {
            ...order,
            amountPaid: order.amountPaid + amount,
            paymentHistory: [...order.paymentHistory, newPayment],
          };
        }
        return order;
      })
    );
  };

  const resetOrders = () => {
    setOrders([]);
    saveToStorage(STORAGE_KEYS.ORDERS, []);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, addPayment, resetOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};