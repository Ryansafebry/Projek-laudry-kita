import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { calculateOrderTotals } from "@/utils/orderUtils";

const Orders = () => {
  const { orders, services } = useOrders();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(order =>
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusConfig = {
    Baru: "bg-blue-500",
    Proses: "bg-yellow-500",
    Selesai: "bg-green-500",
    Diambil: "bg-gray-500",
  };

  const convertYYYYMMDDtoDDMMYYYY = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Daftar Pesanan</h1>
        <Button onClick={() => navigate("/add-order")}>Tambah Order</Button>
      </div>
      <Input
        placeholder="Cari berdasarkan nama pelanggan atau ID pesanan..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pesanan</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Status Pembayaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const { total, amountPaid } = calculateOrderTotals(order, services);
              const isPaid = amountPaid >= total;
              return (
                <TableRow key={order.id} onClick={() => navigate(`/orders/${order.id}`)} className="cursor-pointer">
                  <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{convertYYYYMMDDtoDDMMYYYY(order.orderDate)}</TableCell>
                  <TableCell>Rp {total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[order.status]}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isPaid ? "default" : "destructive"}>
                      {isPaid ? "Lunas" : "Belum Lunas"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;