import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CircleUser,
  Menu,
  Shirt,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  PlusCircle,
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react";
import NotificationPanel from "@/components/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const pathname = location.pathname;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/add-order", label: "Tambah Order", icon: PlusCircle },
    { href: "/orders", label: "Daftar Pesanan", icon: ShoppingCart },
    { href: "/reports", label: "Laporan", icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleSupport = () => {
    navigate("/support");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
              aria-label="Laundry Kita"
            >
              <Shirt className="h-6 w-6" />
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                  pathname.startsWith(link.href) && link.href !== "/dashboard" ? "bg-muted text-foreground" : pathname === "/dashboard" && link.href === "/dashboard" ? "bg-muted text-foreground" : "",
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1 overflow-hidden bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-lg mx-2 border border-teal-100/50 promo-banner">
        <div className="relative h-8 flex items-center">
          <div className="absolute whitespace-nowrap animate-marquee text-sm font-medium text-teal-700 hover:animate-pulse cursor-pointer promo-text">
            🎉 Promo Spesial! Cuci 5kg Gratis Setrika • 💧 Deterjen Premium Tersedia • 🚚 Antar Jemput Gratis Area Kota • ⏰ Buka 24 Jam Setiap Hari • 🎁 Member Baru Diskon 20% • ✨ Garansi Bersih 100%
          </div>
        </div>
      </div>
      
      <NotificationPanel />
      
      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.fullName || 'Akun Saya'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Pengaturan</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSupport} className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Bantuan</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;