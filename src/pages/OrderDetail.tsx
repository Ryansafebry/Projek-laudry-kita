import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Printer, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import PaymentDialog from "@/components/PaymentDialog";
import { calculateOrderTotals } from "@/utils/orderUtils";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, services, updateOrderStatus, deleteOrder } = useOrders();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-2xl font-semibold mb-4">Pesanan tidak ditemukan</p>
        <Button onClick={() => navigate("/orders")}>Kembali ke Daftar Pesanan</Button>
      </div>
    );
  }

  const { total, amountPaid, remainingBalance } = calculateOrderTotals(order, services);
  const getService = (serviceId: string) => services.find(s => s.id === serviceId);

  const statusConfig = {
    Baru: { color: "bg-blue-500", text: "Baru" },
    Proses: { color: "bg-yellow-500", text: "Proses" },
    Selesai: { color: "bg-green-500", text: "Selesai" },
    Diambil: { color: "bg-gray-500", text: "Diambil" },
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
      deleteOrder(order.id);
      navigate("/orders");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Detail Pesanan</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Badge className={`${statusConfig[order.status]?.color || 'bg-gray-500'} mr-2`}>{order.status}</Badge>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(statusConfig).map((status) => (
                <DropdownMenuItem key={status} onSelect={() => updateOrderStatus(order.id, status as keyof typeof statusConfig)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={() => setIsPaymentDialogOpen(true)} disabled={remainingBalance <= 0}>Bayar</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Info Order</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tanggal Order: {new Date(order.orderDate).toLocaleDateString("id-ID")}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis Layanan</TableHead>
                  <TableHead className="text-right">Berat (kg)</TableHead>
                  <TableHead className="text-right">Harga/kg</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const service = getService(item.serviceId);
                  if (!service) return null;
                  const subtotal = item.weight * service.price;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell className="text-right">{item.weight}</TableCell>
                      <TableCell className="text-right">Rp {service.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">Rp {subtotal.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col items-end gap-2 pt-4">
            <Separator className="mb-2" />
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Sudah Dibayar</span>
                <span>Rp {amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4 font-bold text-lg">
                <span className="text-muted-foreground">Sisa Tagihan</span>
                <span className={remainingBalance < 0 ? 'text-red-500' : ''}>
                  Rp {remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Info Pelanggan</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Nama:</strong> {order.customer.name}</div>
              <div><strong>No. HP:</strong> {order.customer.phone}</div>
              <div><strong>Alamat:</strong> {order.customer.address}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Riwayat Pembayaran</CardTitle></CardHeader>
            <CardContent>
              {order.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell className="text-right">Rp {payment.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Belum ada pembayaran.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        orderId={order.id}
        remainingBalance={remainingBalance}
      />
    </div>
  );
};

export default OrderDetail;