import { useParams, Link } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";

const OrderDetail = () => {
  const { orderId } = useParams();
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-2">Order Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-4">
          Order yang Anda cari tidak ada.
        </p>
        <Button asChild>
          <Link to="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Order
          </Link>
        </Button>
      </div>
    );
  }

  const totalAmount = Number(order.total) || 0;
  const totalPaid = order.payments.reduce(
    (acc, payment) => acc + (Number(payment.amount) || 0),
    0
  );
  const remainingBalance = totalAmount - totalPaid;

  const getStatusBadge = (status: "Lunas" | "Belum Lunas" | "Proses") => {
    switch (status) {
      case "Lunas":
        return <Badge variant="success">Lunas</Badge>;
      case "Belum Lunas":
        return <Badge variant="destructive">Belum Lunas</Badge>;
      case "Proses":
        return <Badge variant="secondary">Proses</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Lihat detail lengkap untuk order ini.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <AddPaymentDialog orderId={order.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Order</CardTitle>
          <CardDescription>
            Tanggal Order: {formatDate(order.orderDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Pelanggan</h3>
              <p>{order.customer.name}</p>
              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold">Status</h3>
              {getStatusBadge(order.status)}
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <h3 className="font-semibold mb-2">Item Order</h3>
            <div className="text-sm text-muted-foreground">
              {order.items.map(item => `${item.name} (${item.weight}kg)`).join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembayaran</CardTitle>
          <CardDescription>
            Daftar semua pembayaran yang telah dilakukan untuk order ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.payments.length > 0 ? (
                order.payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Belum ada pembayaran.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tagihan</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sudah Dibayar</span>
              <span>{formatCurrency(totalPaid)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Sisa Tagihan</span>
              <span>{formatCurrency(remainingBalance)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;