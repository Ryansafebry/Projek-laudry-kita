import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

// Define interfaces for our data structures
export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  weight: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  status: "Baru" | "Proses" | "Selesai" | "Diambil";
  orderDate: string;
  payments: Payment[];
}

// Define the context type
export interface OrderContextType {
  orders: Order[];
  services: Service[];
  addOrder: (order: Omit<Order, "id" | "status" | "orderDate" | "payments">) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  addPayment: (orderId: string, payment: Omit<Payment, "id" | "date">) => void;
  resetOrders: () => void;
}

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Dummy data
const initialServices: Service[] = [
  { id: "1", name: "Cuci Setrika", price: 9000 },
  { id: "2", name: "Bed Cover", price: 15000 },
  { id: "3", name: "Cuci Kering", price: 7000 },
];

const initialOrders: Order[] = [
  {
    id: "0535937d-5c67-45f6-8e56-7f3f28e6b359",
    customer: { name: "amy", phone: "085716305678", address: "depok" },
    items: [
      { id: "item-1", serviceId: "1", weight: 50 },
      { id: "item-2", serviceId: "2", weight: 50 },
    ],
    status: "Baru",
    orderDate: "2025-10-02T00:00:00.000Z",
    payments: [
      { id: "payment-1", date: "2025-10-01T00:00:00.000Z", amount: 1200000 },
    ],
  },
];

// Create the provider component
export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [services] = useState<Service[]>(initialServices);

  const addOrder = (order: Omit<Order, "id" | "status" | "orderDate" | "payments">) => {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      status: "Baru",
      orderDate: new Date().toISOString(),
      payments: [],
    };
    setOrders((prevOrders) => [...prevOrders, newOrder]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
  };

  const addPayment = (orderId: string, payment: Omit<Payment, "id" | "date">) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              payments: [
                ...order.payments,
                { ...payment, id: uuidv4(), date: new Date().toISOString() },
              ],
            }
          : order
      )
    );
  };

  const resetOrders = () => {
    setOrders(initialOrders);
  };

  const value = { orders, services, addOrder, updateOrderStatus, deleteOrder, addPayment, resetOrders };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

// Create a custom hook to use the context
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};