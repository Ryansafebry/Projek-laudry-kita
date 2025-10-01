import { Order, Service } from "@/context/OrderContext";

export const calculateOrderTotals = (order: Order, services: Service[]) => {
  const getService = (serviceId: string) => services.find(s => s.id === serviceId);

  const total = order.items.reduce((acc, item) => {
    const service = getService(item.serviceId);
    return acc + item.weight * (service?.price || 0);
  }, 0);

  const amountPaid = order.payments.reduce((acc, payment) => acc + payment.amount, 0);

  const remainingBalance = total - amountPaid;

  return { total, amountPaid, remainingBalance };
};