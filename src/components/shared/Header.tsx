import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, CircleUserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { MainNav } from "./MainNav";
import { PromoSlider } from "./PromoSlider";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                to="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                <span className="sr-only">Laundry Kita</span>
              </Link>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                to="/orders"
                className="text-muted-foreground hover:text-foreground"
              >
                Pesanan
              </Link>
              <Link
                to="/customers"
                className="text-muted-foreground hover:text-foreground"
              >
                Pelanggan
              </Link>
              <Link
                to="/reports"
                className="text-muted-foreground hover:text-foreground"
              >
                Laporan
              </Link>
              <Link
                to="/settings"
                className="text-muted-foreground hover:text-foreground"
              >
                Pengaturan
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex w-full items-center justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUserRound className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="container pb-4">
        <PromoSlider />
      </div>
    </header>
  );
};

export default Header;