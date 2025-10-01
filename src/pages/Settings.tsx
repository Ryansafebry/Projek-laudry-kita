import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useThemeContext } from "@/context/ThemeContext";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const Settings = () => {
  const { theme, setTheme } = useThemeContext();
  const { resetOrders } = useOrders();

  const handleReset = () => {
    resetOrders();
    toast.success("Data order berhasil direset ke data awal.");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Atur preferensi tampilan aplikasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Mode Gelap</Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>Kelola data aplikasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset Data Order</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus semua data order yang ada dan mengembalikannya ke data awal. Tindakan ini tidak dapat diurungkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Ya, Reset Data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-sm text-muted-foreground mt-2">
            Mengembalikan data order ke kondisi awal untuk keperluan demo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;