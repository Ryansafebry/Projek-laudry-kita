import { useState, useMemo } from "react";
import { useOrders } from "@/context/OrderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { calculateOrderTotals } from "@/utils/orderUtils";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

const Reports = () => {
  const { orders, services } = useOrders();
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "Semua",
    paymentStatus: "Semua",
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      if (filters.status !== "Semua" && order.status !== filters.status) return false;

      const { total, amountPaid } = calculateOrderTotals(order, services);
      const isPaid = amountPaid >= total;
      if (filters.paymentStatus === "Lunas" && !isPaid) return false;
      if (filters.paymentStatus === "Belum Lunas" && isPaid) return false;

      return true;
    });
  }, [orders, filters, services]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const totalPesanan = filteredOrders.length;
  const totalPendapatan = filteredOrders.reduce((sum, order) => {
    const { amountPaid } = calculateOrderTotals(order, services);
    return sum + amountPaid;
  }, 0);

  const handleExportExcel = () => {
    exportToExcel(filteredOrders, services, "laporan_pesanan");
  };

  const handleExportPDF = () => {
    exportToPDF(filteredOrders, services, "laporan_pesanan");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Laporan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <Input type="date" value={filters.startDate} onChange={e => handleFilterChange("startDate", e.target.value)} />
          <Input type="date" value={filters.endDate} onChange={e => handleFilterChange("endDate", e.target.value)} />
          <Select value={filters.status} onValueChange={value => handleFilterChange("status", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Status</SelectItem>
              <SelectItem value="Baru">Baru</SelectItem>
              <SelectItem value="Proses">Proses</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
              <SelectItem value="Diambil">Diambil</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.paymentStatus} onValueChange={value => handleFilterChange("paymentStatus", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Pembayaran</SelectItem>
              <SelectItem value="Lunas">Lunas</SelectItem>
              <SelectItem value="Belum Lunas">Belum Lunas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Total Pesanan</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalPesanan}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Pendapatan</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Rp {totalPendapatan.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Hasil Laporan</CardTitle>
          <div className="space-x-2">
            <Button onClick={handleExportExcel}>Export ke Excel</Button>
            <Button onClick={handleExportPDF}>Export ke PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pesanan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead>Status Pesanan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => {
                const { total, amountPaid } = calculateOrderTotals(order, services);
                const isPaid = amountPaid >= total;
                return (
                  <TableRow key={order.id}>
                    <TableCell>{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell className="text-right">Rp {total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={isPaid ? "default" : "destructive"}>
                        {isPaid ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{order.status}</Badge>
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