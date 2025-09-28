import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { showSuccess, showError } from "@/utils/toast";
import { Printer } from "lucide-react";
import { useOrders } from "@/context/OrderContext";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  amountDue: number;
  onPaymentSuccess: () => void;
}

const PaymentDialog = ({ open, onOpenChange, orderId, amountDue, onPaymentSuccess }: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const { addPayment } = useOrders();

  useEffect(() => {
    if (open) {
      setPaymentMethod("");
    }
  }, [open]);

  const handlePayment = () => {
    if (!paymentMethod) {
      showError("Silakan pilih metode pembayaran.");
      return;
    }

    addPayment(orderId, amountDue, paymentMethod);
    
    showSuccess("Pembayaran berhasil!");
    onPaymentSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
          <DialogDescription>
            Selesaikan pembayaran untuk pesanan ID: {orderId}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Tagihan</p>
            <p className="text-3xl font-bold">Rp {amountDue.toLocaleString()}</p>
          </div>
          <div className="grid gap-4">
            <Label>Metode Pembayaran</Label>
            <RadioGroup onValueChange={setPaymentMethod} value={paymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Tunai" id="tunai" />
                <Label htmlFor="tunai">Tunai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Transfer Bank" id="transfer" />
                <Label htmlFor="transfer">Transfer Bank</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="QRIS" id="qris" />
                <Label htmlFor="qris">QRIS</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handlePayment}>
            <Printer className="mr-2 h-4 w-4" /> Bayar & Cetak Struk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;