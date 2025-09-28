import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF, exportToExcel, getExportFilename } from "@/utils/exportUtils";
import { parseDDMMYYYY, convertYYYYMMDDtoDDMMYYYY } from "@/utils/dateFormat";

const Reports = () => {
  const { orders } = useOrders();
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const filteredOrders = orders.filter(order => {
    if (!date?.from) return true;
    
    let orderDate: Date;
    try {
      if (order.orderDate.includes('/')) {
        orderDate = parseDDMMYYYY(order.orderDate);
      } else {
        orderDate = new Date(order.orderDate);
      }
      if (isNaN(orderDate.getTime())) {
        console.error("Invalid date found for order:", order.id);
        return false;
      }
    } catch (error) {
      console.error("Error parsing date for order:", order.id, error);
      return false;
    }
    
    const fromDate = new Date(date.from);
    const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date();
    
    return orderDate >= fromDate && orderDate <= toDate;
  });

  const totalPendapatan = filteredOrders.reduce((sum, order) => sum + order.amountPaid, 0);

  const handleExport = (format: 'Excel' | 'PDF') => {
    if (filteredOrders.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada transaksi untuk diekspor pada rentang tanggal ini.",
        variant: "destructive",
      });
      return;
    }

    const filename = getExportFilename();
    
    try {
      if (format === 'PDF') {
        exportToPDF(filteredOrders, filename);
        toast({
          title: "Export PDF Berhasil",
          description: `Laporan PDF telah dibuat. Silakan simpan atau cetak dokumen.`,
        });
      } else if (format === 'Excel') {
        exportToExcel(filteredOrders, filename);
        toast({
          title: "Export Excel Berhasil",
          description: `File ${filename}.xls telah diunduh.`,
        });
      }
    } catch (error) {
      toast({
        title: "Export Gagal",
        description: `Terjadi kesalahan saat mengekspor laporan ${format}.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pilih rentang tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}>
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Pendapatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">Rp {totalPendapatan.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total pendapatan dari {filteredOrders.length} transaksi dalam rentang tanggal yang dipilih.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{convertYYYYMMDDtoDDMMYYYY(order.orderDate)}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell className="text-right">Rp {order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={order.amountPaid >= order.total ? "default" : "destructive"}>
                        {order.amountPaid >= order.total ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Tidak ada transaksi pada rentang tanggal ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;