import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("hidden md:flex items-center gap-6 text-sm font-medium", className)}
      {...props}
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-lg font-semibold mr-4"
      >
        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        <span className="sr-only">Laundry Kita</span>
      </Link>
      <Link
        to="/dashboard"
        className="text-foreground transition-colors hover:text-foreground"
      >
        Dashboard
      </Link>
      <Link
        to="/orders"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Pesanan
      </Link>
      <Link
        to="/customers"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Pelanggan
      </Link>
      <Link
        to="/reports"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Laporan
      </Link>
      <Link
        to="/settings"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Pengaturan
      </Link>
    </nav>
  );
}