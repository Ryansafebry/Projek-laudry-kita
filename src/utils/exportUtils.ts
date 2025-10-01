import { Order, calculateAmountPaid } from '@/context/OrderContext';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateDDMMYYYY } from './dateUtils';

export const exportToExcel = (data: Order[], fileName: string) => {
  const worksheetData = data.map(order => ({
    ID: order.id,
    Tanggal: formatDateDDMMYYYY(order.orderDate),
    Pelanggan: order.customer.name,
    Total: order.total,
    Dibayar: calculateAmountPaid(order),
    Status: order.status,
    'Status Pembayaran': calculateAmountPaid(order) >= order.total ? 'Lunas' : 'Belum Lunas'
  }));
  const worksheet = utils.json_to_sheet(worksheetData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Orders');
  writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: Order[], fileName: string) => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [['ID', 'Tanggal', 'Pelanggan', 'Total', 'Status Pembayaran']],
    body: data.map(order => [
      order.id,
      formatDateDDMMYYYY(order.orderDate),
      order.customer.name,
      `Rp ${order.total.toLocaleString()}`,
      calculateAmountPaid(order) >= order.total ? 'Lunas' : 'Belum Lunas'
    ]),
  });
  doc.save(`${fileName}.pdf`);
};