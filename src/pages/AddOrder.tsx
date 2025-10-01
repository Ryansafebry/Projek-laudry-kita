import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrders, Customer, OrderItem } from "@/context/OrderContext";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

const services = [
  { id: 1, name: "Cuci Kering Setrika", price: 10000 },
  { id: 2, name: "Cuci Kering", price: 8000 },
  { id: 3, name: "Setrika Saja", price: 7000 },
];

const AddOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const [customer, setCustomer] = useState<Omit<Customer, 'id'>>({ name: "", phone: "", address: "" });
  const [items, setItems] = useState<Partial<OrderItem>[]>([{ serviceId: 1, weight: 0 }]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };
    
    if (field === 'serviceId') {
      const service = services.find(s => s.id === Number(value));
      currentItem.serviceId = Number(value);
      currentItem.name = service?.name;
      currentItem.pricePerKg = service?.price;
    } else if (field === 'weight') {
      currentItem.weight = Number(value);
    }
    
    if (currentItem.pricePerKg && currentItem.weight) {
      currentItem.subtotal = currentItem.pricePerKg * currentItem.weight;
    }

    newItems[index] = currentItem;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { serviceId: 1, weight: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      toast.error("Nama dan nomor telepon pelanggan harus diisi.");
      return;
    }
    if (items.some(item => !item.serviceId || !item.weight || item.weight <= 0)) {
      toast.error("Setiap item harus memiliki layanan dan berat yang valid.");
      return;
    }

    const newOrder = {
      customer: { ...customer, address: customer.address || '' },
      items: items as OrderItem[],
      total,
    };
    addOrder(newOrder);
    toast.success("Order berhasil disimpan!");
    navigate("/orders");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">Tambah Order Baru</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pelanggan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pelanggan</Label>
            <Input id="name" name="name" value={customer.name} onChange={handleCustomerChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" name="phone" type="tel" value={customer.phone} onChange={handleCustomerChange} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Alamat (Opsional)</Label>
            <Textarea id="address" name="address" value={customer.address} onChange={handleCustomerChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Item Laundry</CardTitle>
          <CardDescription>Tambahkan satu atau lebih item laundry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Layanan</Label>
                  <Select
                    value={String(item.serviceId || 1)}
                    onValueChange={(value) => handleItemChange(index, 'serviceId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Berat (kg)</Label>
                  <Input
                    type="number"
                    value={item.weight || ''}
                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center gap-4">
        <div className="text-right">
          <p className="text-muted-foreground">Total Tagihan</p>
          <p className="text-2xl font-bold">Rp {total.toLocaleString()}</p>
        </div>
        <Button type="submit" size="lg">Simpan Order</Button>
      </div>
    </form>
  );
};

export default AddOrder;