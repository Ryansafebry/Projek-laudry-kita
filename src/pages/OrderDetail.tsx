import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/context/AuthContext';
import { Tables } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

type OrderWithItems = Tables<'orders'> & { order_items: Tables<'order_items'>[] };

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (id && user) {
        setLoading(true);
        const data = await supabaseService.getOrderById(id, user.id);
        setOrder(data);
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'baru': return 'default';
      case 'proses': return 'secondary';
      case 'selesai': return 'outline';
      case 'diambil': return 'success';
      default: return 'destructive';
    }
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center">
        <p>Pesanan tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.</p>
        <Button asChild className="mt-4">
          <Link to="/orders">Kembali ke Daftar Pesanan</Link>
        </Button>
      </div>
    );
  }

  // Perhitungan sisa tagihan yang sudah diperbaiki
  const remainingBill = Math.max(0, order.total_price - order.amount_paid);
  const isPaid = remainingBill === 0;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-4">
        <Button asChild variant="outline" size="icon" className="mr-4">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detail Pesanan</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Pesanan #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                Tanggal: {format(new Date(order.created_at), 'dd MMMM yyyy, HH:mm', { locale: localeID })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="font-semibold">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <h3 className="font-semibold mb-2">Rincian Item</h3>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p>{item.service_name}</p>
                  <p className="text-sm text-muted-foreground">{item.weight} kg @ Rp {item.price_per_kg.toLocaleString()}</p>
                </div>
                <p>Rp {item.subtotal.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tagihan</span>
              <span className="font-semibold">Rp {order.total_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sudah Dibayar</span>
              <span>Rp {order.amount_paid.toLocaleString()}</span>
            </div>
            <div className={`flex justify-between gap-4 font-bold text-lg ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
              <span>Sisa Tagihan</span>
              <span>Rp {remainingBill.toLocaleString()}</span>
            </div>
          </div>
          {order.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-semibold mb-1">Catatan</h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const OrderDetailSkeleton = () => (
  <div className="container mx-auto p-4 md:p-6 lg:p-8">
    <div className="flex items-center mb-4">
      <Skeleton className="h-10 w-10 mr-4" />
      <Skeleton className="h-8 w-48" />
    </div>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <Skeleton className="h-6 w-28 mb-2" />
        <div className="space-y-3 mt-3">
          <div className="flex justify-between"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-5 w-1/4" /></div>
          <div className="flex justify-between"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-5 w-1/4" /></div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-3">
          <div className="flex justify-between"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-1/4" /></div>
          <div className="flex justify-between"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-1/4" /></div>
          <div className="flex justify-between"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-6 w-1/4" /></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OrderDetail;