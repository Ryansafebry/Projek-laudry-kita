import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useOrders, calculateAmountPaid } from "@/context/OrderContext";
import { convertYYYYMMDDtoDDMMYYYY, parseDDMMYYYY } from "@/utils/dateUtils";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { FileDown, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

const Reports = () => {
  const { orders } = useOrders();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredOrders = useMemo(() => {
    if (!dateRange?.from) {
      return orders;
    }
    return orders.filter(order => {
      let orderDate: Date;
      try {
        // Tanggal dari context sudah dalam format ISO string, bisa langsung di-parse
        orderDate = new Date(order.orderDate);
        if (isNaN(orderDate.getTime())) {
          console.warn(`Format tanggal tidak valid untuk order ${order.id}: ${order.orderDate}`);
          return false;
        }
      } catch (e) {
        console.error(`Error saat mem-parsing tanggal untuk order ${order.id}: ${order.orderDate}`, e);
        return false;
      }
      
      const from = dateRange.from;
      const to = dateRange.to || from;

      // Set ke awal hari untuk 'from' dan akhir hari untuk 'to'
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      return orderDate >= from && orderDate <= to;
    });
  }, [orders, dateRange]);

  const totalPendapatan = filteredOrders.reduce((sum, order) => sum + calculateAmountPaid(order), 0);
  const totalOrder = filteredOrders.length;
  const orderLunas = filteredOrders.filter(o => o.status === 'Lunas').length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Laporan</h1>
          <p className="text-muted-foreground">Analisis performa laundry Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker onUpdate={(range) => setDateRange(range.range)} />
          <Button onClick={() => exportToExcel(filteredOrders, 'laporan_order')}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => exportToPDF(filteredOrders, 'laporan_order')}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rp {totalPendapatan.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrder}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Lunas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orderLunas}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Laporan</CardTitle>
          <CardDescription>
            Rincian order berdasarkan rentang tanggal yang dipilih.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status Pembayaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => {
                const amountPaid = calculateAmountPaid(order);
                const isPaid = amountPaid >= order.total;
                return (
                  <TableRow key={order.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{convertYYYYMMDDtoDDMMYYYY(order.orderDate)}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell className="text-right">Rp {order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={isPaid ? "success" : "destructive"}>
                        {isPaid ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;