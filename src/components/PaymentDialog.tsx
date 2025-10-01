import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/components/ui/use-toast";

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  remainingBalance: number;
}

const PaymentDialog = ({ open, onOpenChange, orderId, remainingBalance }: PaymentDialogProps) => {
  const [amount, setAmount] = useState(remainingBalance.toString());
  const { addPayment } = useOrders();
  const { toast } = useToast();

  const handlePayment = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({ title: "Error", description: "Jumlah pembayaran tidak valid.", variant: "destructive" });
      return;
    }
    if (paymentAmount > remainingBalance) {
      toast({ title: "Error", description: "Jumlah pembayaran melebihi sisa tagihan.", variant: "destructive" });
      return;
    }

    addPayment(orderId, { amount: paymentAmount });
    toast({ title: "Sukses", description: "Pembayaran berhasil ditambahkan." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan jumlah pembayaran"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Sisa Tagihan: Rp {remainingBalance.toLocaleString()}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handlePayment}>Simpan Pembayaran</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;