/**
 * Export utilities for PDF and Excel generation
 */

import { Order } from '@/context/OrderContext';
import { formatDateDDMMYYYY } from './dateFormat';

// Types for export data
interface ExportOrder {
  no: number;
  id: string;
  tanggal: string;
  pelanggan: string;
  total: number;
  dibayar: number;
  status: string;
  statusPembayaran: string;
}

/**
 * Prepare order data for export
 */
export const prepareExportData = (orders: Order[]): ExportOrder[] => {
  return orders.map((order, index) => ({
    no: index + 1,
    id: order.id,
    tanggal: formatDateDDMMYYYY(order.orderDate),
    pelanggan: order.customer.name,
    total: order.total,
    dibayar: order.amountPaid,
    status: order.status,
    statusPembayaran: order.amountPaid >= order.total ? 'Lunas' : 'Belum Lunas'
  }));
};

/**
 * Export data to CSV format (can be opened in Excel)
 */
export const exportToCSV = (orders: Order[], filename: string = 'laporan-transaksi'): void => {
  const exportData = prepareExportData(orders);
  
  // CSV headers
  const headers = [
    'No',
    'Order ID',
    'Tanggal',
    'Pelanggan',
    'Total (Rp)',
    'Dibayar (Rp)',
    'Status Order',
    'Status Pembayaran'
  ];
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...exportData.map(row => [
      row.no,
      row.id,
      row.tanggal,
      `"${row.pelanggan}"`, // Wrap in quotes to handle names with commas
      row.total,
      row.dibayar,
      row.status,
      row.statusPembayaran
    ].join(','))
  ].join('\n');
  
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel format using HTML table method
 */
export const exportToExcel = (orders: Order[], filename: string = 'laporan-transaksi'): void => {
  const exportData = prepareExportData(orders);
  
  // Calculate totals
  const totalPendapatan = exportData.reduce((sum, order) => sum + order.total, 0);
  const totalDibayar = exportData.reduce((sum, order) => sum + order.dibayar, 0);
  
  // Create HTML table for Excel
  const htmlTable = `
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          <th>No</th>
          <th>Order ID</th>
          <th>Tanggal</th>
          <th>Pelanggan</th>
          <th>Total (Rp)</th>
          <th>Dibayar (Rp)</th>
          <th>Status Order</th>
          <th>Status Pembayaran</th>
        </tr>
      </thead>
      <tbody>
        ${exportData.map(row => `
          <tr>
            <td>${row.no}</td>
            <td>${row.id}</td>
            <td>${row.tanggal}</td>
            <td>${row.pelanggan}</td>
            <td style="text-align: right;">${row.total.toLocaleString()}</td>
            <td style="text-align: right;">${row.dibayar.toLocaleString()}</td>
            <td>${row.status}</td>
            <td style="color: ${row.statusPembayaran === 'Lunas' ? 'green' : 'red'};">${row.statusPembayaran}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background-color: #f9f9f9; font-weight: bold;">
          <td colspan="4">TOTAL</td>
          <td style="text-align: right;">${totalPendapatan.toLocaleString()}</td>
          <td style="text-align: right;">${totalDibayar.toLocaleString()}</td>
          <td colspan="2">-</td>
        </tr>
      </tfoot>
    </table>
  `;
  
  // Create Excel file using HTML
  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <meta name="ProgId" content="Excel.Sheet">
        <meta name="Generator" content="Microsoft Excel 15">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Laporan Transaksi Laundry Kita</h2>
        <p>Tanggal Export: ${formatDateDDMMYYYY(new Date())}</p>
        ${htmlTable}
      </body>
    </html>
  `;
  
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to PDF using HTML to PDF conversion
 */
export const exportToPDF = (orders: Order[], filename: string = 'laporan-transaksi'): void => {
  const exportData = prepareExportData(orders);
  
  // Calculate totals
  const totalPendapatan = exportData.reduce((sum, order) => sum + order.total, 0);
  const totalDibayar = exportData.reduce((sum, order) => sum + order.dibayar, 0);
  
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Laporan Transaksi</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          font-size: 12px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .report-title {
          font-size: 18px;
          margin: 10px 0;
        }
        .report-date {
          font-size: 12px;
          color: #666;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold;
          text-align: center;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row {
          background-color: #f9f9f9;
          font-weight: bold;
        }
        .status-lunas { color: green; font-weight: bold; }
        .status-belum { color: red; font-weight: bold; }
        .summary {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">LAUNDRY KITA</div>
        <div class="report-title">Laporan Transaksi</div>
        <div class="report-date">Tanggal Export: ${formatDateDDMMYYYY(new Date())}</div>
      </div>
      
      <div class="summary">
        <h3>Ringkasan</h3>
        <p><strong>Total Transaksi:</strong> ${exportData.length} pesanan</p>
        <p><strong>Total Pendapatan:</strong> Rp ${totalPendapatan.toLocaleString()}</p>
        <p><strong>Total Dibayar:</strong> Rp ${totalDibayar.toLocaleString()}</p>
        <p><strong>Sisa Tagihan:</strong> Rp ${(totalPendapatan - totalDibayar).toLocaleString()}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th width="5%">No</th>
            <th width="12%">Order ID</th>
            <th width="12%">Tanggal</th>
            <th width="25%">Pelanggan</th>
            <th width="15%">Total</th>
            <th width="15%">Dibayar</th>
            <th width="10%">Status</th>
            <th width="16%">Pembayaran</th>
          </tr>
        </thead>
        <tbody>
          ${exportData.map(row => `
            <tr>
              <td class="text-center">${row.no}</td>
              <td class="text-center">${row.id}</td>
              <td class="text-center">${row.tanggal}</td>
              <td>${row.pelanggan}</td>
              <td class="text-right">Rp ${row.total.toLocaleString()}</td>
              <td class="text-right">Rp ${row.dibayar.toLocaleString()}</td>
              <td class="text-center">${row.status}</td>
              <td class="text-center ${row.statusPembayaran === 'Lunas' ? 'status-lunas' : 'status-belum'}">${row.statusPembayaran}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" class="text-center">TOTAL</td>
            <td class="text-right">Rp ${totalPendapatan.toLocaleString()}</td>
            <td class="text-right">Rp ${totalDibayar.toLocaleString()}</td>
            <td colspan="2" class="text-center">-</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;
  
  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
};

/**
 * Get filename with current date
 */
export const getExportFilename = (prefix: string = 'laporan-transaksi'): string => {
  const currentDate = formatDateDDMMYYYY(new Date()).replace(/\//g, '-');
  return `${prefix}-${currentDate}`;
};
