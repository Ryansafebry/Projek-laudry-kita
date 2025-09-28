import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { services } from "@/data/mock";
import { showError, showSuccess } from "@/utils/toast";
import { useOrders } from "@/context/OrderContext";

interface ServiceItem {
  id: string;
  serviceId: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
}

const AddOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrders();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  const addServiceItem = () => {
    setServiceItems([
      ...serviceItems,
      { id: crypto.randomUUID(), serviceId: "", weight: 0, pricePerKg: 0, subtotal: 0 },
    ]);
  };

  const removeServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter((item) => item.id !== id));
  };

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: any) => {
    const newItems = serviceItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === "serviceId") {
          const selectedService = services.find(s => s.id.toString() === value);
          updatedItem.pricePerKg = selectedService?.pricePerKg || 0;
        }

        if (field === "serviceId" || field === "weight") {
            updatedItem.subtotal = updatedItem.weight * updatedItem.pricePerKg;
        }

        return updatedItem;
      }
      return item;
    });
    setServiceItems(newItems);
  };

  const totalHarga = useMemo(() => {
    return serviceItems.reduce((total, item) => total + item.subtotal, 0);
  }, [serviceItems]);

  const handleSaveOrder = () => {
    if (!customerName) {
        showError("Nama pelanggan harus diisi.");
        return;
    }
    if (serviceItems.length === 0) {
        showError("Tambahkan setidaknya satu layanan.");
        return;
    }

    const newOrder = {
        customer: { id: Date.now(), name: customerName, phone: customerPhone, address: customerAddress },
        items: serviceItems.map(item => {
            const service = services.find(s => s.id.toString() === item.serviceId);
            return {
                serviceId: parseInt(item.serviceId),
                name: service?.name || "Unknown Service",
                weight: item.weight,
                pricePerKg: item.pricePerKg,
                subtotal: item.subtotal,
            };
        }),
        total: totalHarga,
    };

    addOrder(newOrder);
    showSuccess("Order berhasil disimpan!");
    navigate("/orders");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tambah Order Baru</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pelanggan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="customer-name">Nama Pelanggan</Label>
            <Input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama Pelanggan" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer-phone">Nomor HP</Label>
            <Input id="customer-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Nomor HP" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer-address">Alamat</Label>
            <Input id="customer-address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Alamat" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detail Layanan</CardTitle>
          <Button size="sm" onClick={addServiceItem}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Layanan
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Jenis Layanan</TableHead>
                <TableHead>Berat (kg)</TableHead>
                <TableHead>Harga /kg</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Select onValueChange={(value) => updateServiceItem(item.id, "serviceId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={item.weight} onChange={(e) => updateServiceItem(item.id, "weight", parseFloat(e.target.value) || 0)} />
                  </TableCell>
                  <TableCell>Rp {item.pricePerKg.toLocaleString()}</TableCell>
                  <TableCell>Rp {item.subtotal.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeServiceItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center gap-6">
        <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Harga</p>
            <p className="text-2xl font-bold">Rp {totalHarga.toLocaleString()}</p>
        </div>
        <Button size="lg" onClick={handleSaveOrder}>
          <Save className="mr-2 h-4 w-4" /> Simpan Order
        </Button>
      </div>
    </div>
  );
};

export default AddOrder;