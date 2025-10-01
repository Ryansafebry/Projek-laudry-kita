import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

const AddOrder = () => {
  const navigate = useNavigate();
  const { services, addOrder } = useOrders();
  const { toast } = useToast();
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [items, setItems] = useState<{ serviceId: string; weight: number }[]>([]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setItems([...items, { serviceId: "", weight: 0 }]);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'serviceId') {
      newItems[index].serviceId = value as string;
    } else if (field === 'weight') {
      newItems[index].weight = Number(value);
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const getService = (serviceId: string) => services.find(s => s.id === serviceId);

  const handleSubmit = () => {
    if (!customer.name || !customer.phone) {
      toast({ title: "Error", description: "Nama dan No. HP pelanggan harus diisi.", variant: "destructive" });
      return;
    }
    if (items.length === 0 || items.some(item => !item.serviceId || item.weight <= 0)) {
      toast({ title: "Error", description: "Harap isi detail layanan dengan benar.", variant: "destructive" });
      return;
    }

    const newOrder = {
      customer,
      items: items.map(item => ({
        id: uuidv4(),
        serviceId: item.serviceId,
        weight: item.weight,
      })),
    };

    addOrder(newOrder);
    toast({ title: "Sukses", description: "Order berhasil disimpan!" });
    navigate("/orders");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tambah Order Baru</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Detail Layanan</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Layanan</TableHead>
                    <TableHead>Berat (kg)</TableHead>
                    <TableHead>Harga/kg</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const service = getService(item.serviceId);
                    const price = service?.price || 0;
                    const subtotal = item.weight * price;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Select value={item.serviceId} onValueChange={(value) => handleItemChange(index, 'serviceId', value)}>
                            <SelectTrigger><SelectValue placeholder="Pilih layanan" /></SelectTrigger>
                            <SelectContent>
                              {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.weight} onChange={(e) => handleItemChange(index, 'weight', e.target.value)} />
                        </TableCell>
                        <TableCell>Rp {price.toLocaleString()}</TableCell>
                        <TableCell>Rp {subtotal.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button onClick={handleAddItem} className="mt-4">Tambah Layanan</Button>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Info Pelanggan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input name="name" placeholder="Nama Pelanggan" value={customer.name} onChange={handleCustomerChange} />
              <Input name="phone" placeholder="No. HP" value={customer.phone} onChange={handleCustomerChange} />
              <Input name="address" placeholder="Alamat" value={customer.address} onChange={handleCustomerChange} />
            </CardContent>
          </Card>
          <Button onClick={handleSubmit} className="w-full">Simpan Order</Button>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;