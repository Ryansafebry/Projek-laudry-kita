import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/context/OrderContext";
import { calculateOrderTotals } from "@/utils/orderUtils";
import { Users, Wallet, ShoppingCart, CheckCircle } from "lucide-react";

const Index = () => {
  const { orders, services } = useOrders();

  const today = new Date().setHours(0, 0, 0, 0);
  const ordersToday = orders.filter(order => new Date(order.orderDate).setHours(0, 0, 0, 0) === today);
  
  const incomeToday = ordersToday.reduce((sum, order) => {
    const { amountPaid } = calculateOrderTotals(order, services);
    return sum + amountPaid;
  }, 0);

  const totalOrders = orders.length;
  const totalIncome = orders.reduce((sum, order) => {
    const { amountPaid } = calculateOrderTotals(order, services);
    return sum + amountPaid;
  }, 0);
  
  const completedOrders = orders.filter(order => order.status === 'Diambil').length;

  const recentOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 5);

  const statusConfig = {
    Baru: "bg-blue-500",
    Proses: "bg-yellow-500",
    Selesai: "bg-green-500",
    Diambil: "bg-gray-500",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pendapatan hari ini: Rp {incomeToday.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">{ordersToday.length} pesanan hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">Total pesanan yang sudah diambil</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{[...new Set(orders.map(o => o.customer.phone))].length}</div>
            <p className="text-xs text-muted-foreground">Jumlah pelanggan unik</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => {
                const { total } = calculateOrderTotals(order, services);
                return (
                  <TableRow key={order.id}>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[order.status]}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {total.toLocaleString()}
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

export default Index;