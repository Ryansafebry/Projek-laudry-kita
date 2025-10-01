import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrders } from '@/context/OrderContext';
import { toast } from 'sonner';

interface PaymentDialogProps {
  orderId: string;
  amountDue: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentDialog = ({ orderId, amountDue, open, onOpenChange }: PaymentDialogProps) => {
  const { addPayment } = useOrders();
  const [paymentAmount, setPaymentAmount] = useState(amountDue.toString());
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Jumlah pembayaran tidak valid.');
      return;
    }
    
    // FIX: Memanggil addPayment dengan format yang benar
    addPayment(orderId, { amount, method: paymentMethod });

    toast.success('Pembayaran berhasil ditambahkan!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran</DialogTitle>
          <DialogDescription>
            Sisa tagihan: Rp {amountDue.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran</Label>
            <Input
              id="amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">Metode Pembayaran</Label>
            <Input
              id="method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleAddPayment}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};