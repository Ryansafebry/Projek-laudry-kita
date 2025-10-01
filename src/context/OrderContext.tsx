import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { orders as mockOrders } from '@/data/mock';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/utils/localStorage';
import { getCurrentDateDDMMYYYY } from '@/utils/dateFormat';
import { useAuth } from './AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { TablesInsert } from '@/lib/supabase';

// Unified Order Type for both local and Supabase
export interface OrderItem {
  serviceId?: number; // local
  id?: string; // supabase
  name: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
}

export interface PaymentHistory {
  date: string;
  amount: number;
  method: string;
  status: string;
}

export interface Order {
  id: string;
  customer: {
    id?: number; // local
    name: string;
    phone: string;
    address: string;
  };
  orderDate: string;
  status: string;
  items: OrderItem[];
  total: number;
  amountPaid: number;
  paymentHistory: PaymentHistory[];
}

interface OrderContextType {
  orders: Order[];
  addOrder: (newOrderData: Omit<Order, 'id' | 'orderDate' | 'status' | 'amountPaid' | 'paymentHistory'>) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  addPayment: (orderId: string, amount: number, method: string) => Promise<void>;
  resetOrders: () => void;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user, useSupabase } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch data from Supabase
  const fetchSupabaseOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabaseOrders = await supabaseService.getOrders(user.id);
      const payments = await supabaseService.getPayments(user.id);

      // Map Supabase data to unified Order type
      const mappedOrders: Order[] = supabaseOrders.map(so => ({
        id: so.id,
        customer: {
          name: so.customer_name,
          phone: so.customer_phone || '',
          address: so.customer_address || '',
        },
        orderDate: getCurrentDateDDMMYYYY(), // Supabase `created_at` is timestamp, simplify for now
        status: so.status,
        items: so.order_items.map(item => ({
          id: item.id,
          name: item.service_name,
          weight: item.weight,
          pricePerKg: item.price_per_kg,
          subtotal: item.subtotal,
        })),
        total: so.total_price,
        amountPaid: so.amount_paid,
        paymentHistory: payments
          .filter(p => p.order_id === so.id)
          .map(p => ({
            date: p.payment_date || p.created_at,
            amount: p.amount,
            method: p.payment_method,
            status: p.payment_status,
          })),
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching Supabase orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Effect to load data based on mode (Supabase vs LocalStorage)
  useEffect(() => {
    if (useSupabase && user) {
      fetchSupabaseOrders();
    } else {
      const savedOrders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
      setOrders(savedOrders.length > 0 ? savedOrders : mockOrders);
    }
  }, [useSupabase, user, fetchSupabaseOrders]);

  // Save to localStorage when not in Supabase mode
  useEffect(() => {
    if (!useSupabase) {
      saveToStorage(STORAGE_KEYS.ORDERS, orders);
    }
  }, [orders, useSupabase]);

  const addOrder = async (newOrderData: Omit<Order, 'id' | 'orderDate' | 'status' | 'amountPaid' | 'paymentHistory'>) => {
    if (useSupabase && user) {
      const orderPayload: TablesInsert<'orders'> = {
        user_id: user.id,
        customer_name: newOrderData.customer.name,
        customer_phone: newOrderData.customer.phone,
        customer_address: newOrderData.customer.address,
        total_price: newOrderData.total,
        status: 'Baru',
      };
      const itemsPayload = newOrderData.items.map(item => ({
        service_name: item.name,
        weight: item.weight,
        price_per_kg: item.pricePerKg,
        subtotal: item.subtotal,
      }));
      
      await supabaseService.createOrderWithItems(orderPayload, itemsPayload);
      await fetchSupabaseOrders(); // Refetch data
    } else {
      const newOrder: Order = {
        ...newOrderData,
        id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
        orderDate: getCurrentDateDDMMYYYY(),
        status: 'Baru',
        amountPaid: 0,
        paymentHistory: [],
      };
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    }
    // Trigger notification
    if ((window as any).addOrderNotification) {
      (window as any).addOrderNotification(orders.length.toString(), 'new', newOrderData.customer.name);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (useSupabase) {
      await supabaseService.updateOrder(orderId, { status: newStatus });
      await fetchSupabaseOrders(); // Refetch data
    } else {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  const addPayment = async (orderId: string, amount: number, method: string) => {
    if (useSupabase && user) {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const newAmountPaid = order.amountPaid + amount;
      await supabaseService.updateOrder(orderId, { amount_paid: newAmountPaid });
      
      const paymentPayload: TablesInsert<'payments'> = {
        order_id: orderId,
        user_id: user.id,
        amount: amount,
        payment_method: method,
      };
      await supabaseService.createPayment(paymentPayload);
      await fetchSupabaseOrders(); // Refetch data
    } else {
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
    }
  };

  const resetOrders = () => {
    if (useSupabase) {
      // This should be an admin action, for now, we just clear local state
      console.warn("Resetting Supabase data should be handled with care via backend functions.");
      setOrders([]);
    } else {
      setOrders([]);
      saveToStorage(STORAGE_KEYS.ORDERS, []);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, addPayment, resetOrders, loading }}>
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