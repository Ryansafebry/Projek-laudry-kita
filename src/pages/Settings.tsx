import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeContext } from "@/context/ThemeContext";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { theme, setTheme } = useThemeContext();
  const { resetOrders } = useOrders();
  const { toast } = useToast();

  const handleResetData = () => {
    if (window.confirm("Apakah Anda yakin ingin mereset semua data pesanan? Tindakan ini tidak dapat diurungkan.")) {
      resetOrders();
      toast({ title: "Sukses", description: "Data pesanan berhasil direset." });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pengaturan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Label htmlFor="theme">Tema</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Terang</SelectItem>
                <SelectItem value="dark">Gelap</SelectItem>
                <SelectItem value="system">Sistem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Mereset data akan menghapus semua pesanan yang ada dan mengembalikannya ke data awal.
          </p>
          <Button variant="destructive" onClick={handleResetData}>
            Reset Data Pesanan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;