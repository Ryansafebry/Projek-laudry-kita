import React, { createContext, useState, useContext, ReactNode } from "react";

// Tipe data yang lebih detail dan akurat
export type Customer = {
  id?: number;
  name: string;
  phone: string;
  address?: string;
};

export type OrderItem = {
  serviceId: number;
  name: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
};

export type Payment = {
  date: string;
  method: string;
  amount: number;
};

// Tipe Order utama yang telah diperbarui
export type Order = {
  id: string;
  customer: Customer; // Diubah menjadi objek
  items: OrderItem[]; // Diubah menjadi array
  total: number;
  status: "Lunas" | "Belum Lunas" | "Proses";
  orderDate: string; // Mengganti nama dari 'date'
  payments: Payment[];
};

// Fungsi utilitas untuk menghitung total yang sudah dibayar
export const calculateAmountPaid = (order: Order) => {
  if (!order.payments) return 0;
  return order.payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
};

type OrderContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "status" | "payments" | "orderDate">) => void;
  addPayment: (orderId: string, payment: Omit<Payment, "date">) => void;
  resetOrders: () => void; // Menambahkan fungsi reset
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const initialOrders: Order[] = [
    {
      id: "ORD001",
      customer: { name: "John Doe", phone: "081234567890" },
      items: [{ serviceId: 1, name: "Cuci Kering Setrika", weight: 5, pricePerKg: 10000, subtotal: 50000 }],
      total: 50000,
      status: "Lunas",
      orderDate: "2023-10-26T10:00:00Z",
      payments: [{ date: "2023-10-26T10:00:00Z", method: "Cash", amount: 50000 }],
    },
    {
      id: "ORD002",
      customer: { name: "Jane Smith", phone: "081234567891" },
      items: [{ serviceId: 2, name: "Cuci Karpet", weight: 1, pricePerKg: 100000, subtotal: 100000 }],
      total: 100000,
      status: "Belum Lunas",
      orderDate: "2023-10-25T14:30:00Z",
      payments: [{ date: "2023-10-25T14:30:00Z", method: "Transfer", amount: 50000 }],
    },
];

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addOrder = (order: Omit<Order, "id" | "status" | "payments" | "orderDate">) => {
    const newOrder: Order = {
      ...order,
      id: `ORD${(orders.length + 1).toString().padStart(3, "0")}`,
      status: "Proses",
      payments: [],
      orderDate: new Date().toISOString(),
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  const addPayment = (orderId: string, payment: Omit<Payment, "date">) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const newPayment: Payment = { ...payment, date: new Date().toISOString() };
          const updatedPayments = [...order.payments, newPayment];
          const totalPaid = updatedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
          const newStatus = totalPaid >= order.total ? "Lunas" : "Belum Lunas";
          return { ...order, payments: updatedPayments, status: newStatus };
        }
        return order;
      })
    );
  };

  const resetOrders = () => {
    setOrders(initialOrders);
    console.log("Data order direset ke kondisi awal.");
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, addPayment, resetOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};