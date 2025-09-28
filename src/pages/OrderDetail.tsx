import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { DollarSign, CheckCircle, Truck, PackageCheck } from "lucide-react";
import PaymentDialog from "@/components/PaymentDialog";
import { useOrders } from "@/context/OrderContext";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { sendOrderNotification, sendAutomaticWhatsApp } from "@/utils/whatsapp";
import { convertYYYYMMDDtoDDMMYYYY } from "@/utils/dateFormat";
import { cn } from "@/lib/utils";

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, updateOrderStatus } = useOrders();
  const { addOrderNotification } = useNotifications();
  const { toast } = useToast();
  const order = orders.find(o => o.id === orderId);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  if (!order) {
    return <div>Order not found</div>;
  }

  const orderStatuses = ["Baru", "Diproses", "Selesai", "Diambil"];
  const amountDue = order.total - order.amountPaid;

  const handlePaymentSuccess = () => {
    // Di aplikasi nyata, Anda akan memuat ulang data pesanan di sini
    // untuk menampilkan status pembayaran yang diperbarui.
    console.log("Pembayaran berhasil, memuat ulang data...");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (orderId && order) {
      updateOrderStatus(orderId, newStatus);
      
      // Trigger notification based on status
      switch (newStatus) {
        case 'Baru':
          addOrderNotification(orderId, 'new', order.customer.name);
          break;
        case 'Diproses':
          addOrderNotification(orderId, 'processing', order.customer.name);
          // Send automatic WhatsApp notification
          toast({
            title: "Mengirim WhatsApp...",
            description: `Sedang mengirim notifikasi ke ${order.customer.name}`,
          });
          
          try {
            const result = await sendAutomaticWhatsApp(order.customer.name, order.customer.phone, orderId, 'Diproses');
            toast({
              title: result.success ? "✅ WhatsApp Terkirim" : "❌ Gagal Mengirim",
              description: result.message,
              variant: result.success ? "default" : "destructive",
            });
          } catch (error) {
            toast({
              title: "❌ Error",
              description: "Terjadi kesalahan saat mengirim WhatsApp",
              variant: "destructive",
            });
          }
          break;
        case 'Selesai':
          addOrderNotification(orderId, 'completed', order.customer.name);
          // Send automatic WhatsApp notification
          toast({
            title: "Mengirim WhatsApp...",
            description: `Sedang mengirim notifikasi ke ${order.customer.name}`,
          });
          
          try {
            const result = await sendAutomaticWhatsApp(order.customer.name, order.customer.phone, orderId, 'Selesai');
            toast({
              title: result.success ? "✅ WhatsApp Terkirim" : "❌ Gagal Mengirim",
              description: result.message,
              variant: result.success ? "default" : "destructive",
            });
          } catch (error) {
            toast({
              title: "❌ Error",
              description: "Terjadi kesalahan saat mengirim WhatsApp",
              variant: "destructive",
            });
          }
          break;
        case 'Diambil':
          addOrderNotification(orderId, 'picked_up', order.customer.name);
          // Send automatic WhatsApp notification
          toast({
            title: "Mengirim WhatsApp...",
            description: `Sedang mengirim notifikasi ke ${order.customer.name}`,
          });
          
          try {
            const result = await sendAutomaticWhatsApp(order.customer.name, order.customer.phone, orderId, 'Diambil');
            toast({
              title: result.success ? "✅ WhatsApp Terkirim" : "❌ Gagal Mengirim",
              description: result.message,
              variant: result.success ? "default" : "destructive",
            });
          } catch (error) {
            toast({
              title: "❌ Error",
              description: "Terjadi kesalahan saat mengirim WhatsApp",
              variant: "destructive",
            });
          }
          break;
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Detail Pesanan</h1>
            <p className="text-muted-foreground">Order ID: {order.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ubah status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('Diproses')}
              className={cn(
                order.status === 'Diproses' && 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-yellow-500'
              )}
            >
              <Truck className="mr-2 h-4 w-4" /> Proses
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('Selesai')}
              className={cn(
                order.status === 'Selesai' && 'bg-green-500 text-white hover:bg-green-600 border-green-600'
              )}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Selesai
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('Diambil')}
              className={cn(
                order.status === 'Diambil' && 'bg-blue-500 text-white hover:bg-blue-600 border-blue-600'
              )}
            >
              <PackageCheck className="mr-2 h-4 w-4" /> Diambil
            </Button>
            <Button onClick={() => setIsPaymentDialogOpen(true)} disabled={amountDue <= 0}>
              <DollarSign className="mr-2 h-4 w-4" /> Bayar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Info Order</CardTitle>
              <CardDescription>Tanggal Order: {convertYYYYMMDDtoDDMMYYYY(order.orderDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Layanan</TableHead>
                    <TableHead className="text-center">Berat (kg)</TableHead>
                    <TableHead className="text-right">Harga/kg</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-center">{item.weight}</TableCell>
                      <TableCell className="text-right">Rp {item.pricePerKg.toLocaleString()}</TableCell>
                      <TableCell className="text-right">Rp {item.subtotal.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="flex justify-end text-right">
                <div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Total</span>
                    <span>Rp {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Sudah Dibayar</span>
                    <span>Rp {order.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4 font-bold text-lg">
                    <span>Sisa Tagihan</span>
                    <span>Rp {(order.total - order.amountPaid).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Info Pelanggan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Nama:</strong> {order.customer.name}</p>
                <p><strong>No. HP:</strong> {order.customer.phone}</p>
                <p><strong>Alamat:</strong> {order.customer.address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.paymentHistory.length > 0 ? (
                      order.paymentHistory.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>{convertYYYYMMDDtoDDMMYYYY(payment.date)}</TableCell>
                          <TableCell className="text-right">Rp {payment.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          Belum ada pembayaran.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        orderId={order.id}
        amountDue={amountDue}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default OrderDetail;