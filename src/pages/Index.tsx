import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  PlusCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { getCurrentDateDDMMYYYY, convertYYYYMMDDtoDDMMYYYY } from "@/utils/dateFormat";

const Index = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const recentOrders = orders.slice(0, 5);

  const today = getCurrentDateDDMMYYYY();
  const ordersToday = orders.filter(order => {
    // Convert order date to DD/MM/YYYY format for comparison
    const orderDateFormatted = convertYYYYMMDDtoDDMMYYYY(order.orderDate);
    return orderDateFormatted === today;
  });
  const incomeToday = ordersToday.reduce((sum, order) => sum + order.amountPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/add-order")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Order
          </Button>
          <Button variant="outline" onClick={() => navigate("/reports")}>
            <FileText className="mr-2 h-4 w-4" /> Laporan Hari Ini
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Order Hari Ini
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersToday.length}</div>
            <p className="text-xs text-muted-foreground">Total pesanan untuk hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pemasukan Hari Ini
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {incomeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total pembayaran diterima hari ini</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pesanan Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>
                    <Badge>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {order.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      Lihat <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;