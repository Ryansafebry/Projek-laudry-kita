import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/context/OrderContext";
import { convertYYYYMMDDtoDDMMYYYY } from "@/utils/dateUtils";
import { PlusCircle, Search } from "lucide-react";

const Orders = () => {
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Daftar Order</h1>
          <p className="text-muted-foreground">Kelola semua order laundry Anda.</p>
        </div>
        <Button asChild>
          <Link to="/add-order">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Order Baru
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Semua Order</CardTitle>
          <CardDescription>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari berdasarkan ID atau nama pelanggan..."
                className="pl-8 sm:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{convertYYYYMMDDtoDDMMYYYY(order.orderDate)}</TableCell>
                  <TableCell>Rp {order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "Lunas" ? "success" : order.status === "Proses" ? "secondary" : "destructive"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/orders/${order.id}`}>Lihat Detail</Link>
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

export default Orders;