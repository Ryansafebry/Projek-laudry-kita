import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOrders, calculateAmountPaid } from "@/context/OrderContext";
import { Link } from "react-router-dom";
import { DollarSign, ShoppingCart, Users, ArrowRight } from "lucide-react";
import { convertYYYYMMDDtoDDMMYYYY, getTodayDDMMYYYY } from "@/utils/dateUtils";

const Index = () => {
  const { orders } = useOrders();

  const today = getTodayDDMMYYYY();
  const ordersToday = orders.filter(order => {
    const orderDateFormatted = convertYYYYMMDDtoDDMMYYYY(order.orderDate);
    return orderDateFormatted === today;
  });
  const incomeToday = ordersToday.reduce((sum, order) => sum + calculateAmountPaid(order), 0);

  const totalOrders = orders.length;
  const totalIncome = orders.reduce((sum, order) => sum + calculateAmountPaid(order), 0);
  
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Pendapatan hari ini: Rp {incomeToday.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {ordersToday.length} order hari ini
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Baru</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">
              Bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order Terbaru</CardTitle>
            <p className="text-sm text-muted-foreground">
              5 order terakhir yang masuk.
            </p>
          </div>
          <Link to="/orders" className="text-sm font-medium text-primary hover:underline flex items-center">
            Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "Lunas" ? "success" : order.status === "Proses" ? "secondary" : "destructive"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">Rp {order.total.toLocaleString()}</TableCell>
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