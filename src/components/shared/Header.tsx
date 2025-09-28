import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Laundry, User, LayoutDashboard, FileText, Users, Settings } from "lucide-react";

const Header = () => {
  const navLinks = [
    { to: "/", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/orders", icon: Laundry, text: "Pesanan" },
    { to: "/customers", icon: Users, text: "Pelanggan" },
    { to: "/reports", icon: FileText, text: "Laporan" },
    { to: "/settings", icon: Settings, text: "Pengaturan" },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Laundry className="h-6 w-6 text-teal-600" />
          <span className="sr-only">Laundry Kita</span>
        </Link>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.text}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
              <Laundry className="h-6 w-6 text-teal-600" />
              <span className="sr-only">Laundry Kita</span>
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <link.icon className="h-5 w-5" />
                {link.text}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <Button variant="secondary" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;