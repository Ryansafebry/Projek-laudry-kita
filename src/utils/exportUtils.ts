import { Order, Service } from "@/context/OrderContext";
import { calculateOrderTotals } from "./orderUtils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("id-ID");

const getExportData = (orders: Order[], services: Service[]) => {
  return orders.map(order => {
    const { total, amountPaid } = calculateOrderTotals(order, services);
    const isPaid = amountPaid >= total;
    return {
      id: order.id.substring(0, 8),
      tanggal: formatDate(order.orderDate),
      pelanggan: order.customer.name,
      total: total,
      dibayar: amountPaid,
      status: order.status,
      statusPembayaran: isPaid ? 'Lunas' : 'Belum Lunas'
    };
  });
};

export const exportToExcel = (orders: Order[], services: Service[], fileName: string) => {
  const data = getExportData(orders, services);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pesanan");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (orders: Order[], services: Service[], fileName: string) => {
  const doc = new jsPDF();
  const data = getExportData(orders, services);
  
  (doc as any).autoTable({
    head: [['ID', 'Tanggal', 'Pelanggan', 'Total', 'Dibayar', 'Status', 'Pembayaran']],
    body: data.map(o => [o.id, o.tanggal, o.pelanggan, `Rp ${o.total.toLocaleString()}`, `Rp ${o.dibayar.toLocaleString()}`, o.status, o.statusPembayaran]),
  });

  doc.save(`${fileName}.pdf`);
};