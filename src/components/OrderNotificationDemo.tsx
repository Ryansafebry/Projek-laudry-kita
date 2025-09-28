import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/context/NotificationContext";
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  Package
} from "lucide-react";

const OrderNotificationDemo = () => {
  const { addOrderNotification } = useNotifications();

  const triggerNewOrder = () => {
    const orderId = `ORD-${String(Date.now()).slice(-6)}`;
    addOrderNotification(orderId, 'new', 'Budi Santoso');
  };

  const triggerProcessingOrder = () => {
    const orderId = `ORD-${String(Date.now()).slice(-6)}`;
    addOrderNotification(orderId, 'processing', 'Siti Nurhaliza');
  };

  const triggerCompletedOrder = () => {
    const orderId = `ORD-${String(Date.now()).slice(-6)}`;
    addOrderNotification(orderId, 'completed', 'Ahmad Wijaya');
  };

  const triggerPickedUpOrder = () => {
    const orderId = `ORD-${String(Date.now()).slice(-6)}`;
    addOrderNotification(orderId, 'picked_up', 'Dewi Sartika');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          Demo Notifikasi Pesanan
        </CardTitle>
        <CardDescription>
          Klik tombol di bawah untuk mensimulasikan notifikasi status pesanan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={triggerNewOrder}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <Plus className="h-6 w-6 text-blue-600" />
            <div className="text-center">
              <div className="font-medium">Pesanan Baru</div>
              <div className="text-xs text-muted-foreground">Pesanan masuk dari pelanggan</div>
            </div>
          </Button>

          <Button
            onClick={triggerProcessingOrder}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <Clock className="h-6 w-6 text-orange-600" />
            <div className="text-center">
              <div className="font-medium">Sedang Diproses</div>
              <div className="text-xs text-muted-foreground">Pesanan dalam pencucian</div>
            </div>
          </Button>

          <Button
            onClick={triggerCompletedOrder}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="text-center">
              <div className="font-medium">Pesanan Selesai</div>
              <div className="text-xs text-muted-foreground">Siap untuk diambil</div>
            </div>
          </Button>

          <Button
            onClick={triggerPickedUpOrder}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <Package className="h-6 w-6 text-purple-600" />
            <div className="text-center">
              <div className="font-medium">Pesanan Diambil</div>
              <div className="text-xs text-muted-foreground">Telah diambil pelanggan</div>
            </div>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <h4 className="font-medium text-teal-800 mb-2">Fitur Notifikasi Aktif:</h4>
          <ul className="text-sm text-teal-700 space-y-1">
            <li>• Notifikasi real-time untuk setiap perubahan status</li>
            <li>• Browser notification (jika diizinkan)</li>
            <li>• Toast notification di aplikasi</li>
            <li>• Action button untuk navigasi langsung</li>
            <li>• Auto-simulation setiap 20 detik</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderNotificationDemo;
