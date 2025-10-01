import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Shirt,
  FileText,
  PlusCircle,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/add-order", label: "Tambah Order", icon: PlusCircle },
    { href: "/orders", label: "Daftar Pesanan", icon: ShoppingCart },
    { href: "/reports", label: "Laporan", icon: FileText },
  ];

  return (
    <div className="hidden border-r md:block sidebar-gradient dark:sidebar-gradient-dark">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-white/20 px-4 lg:h-[60px] lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-white">
            <Shirt className="h-6 w-6" />
            <span className="text-xl lg:text-2xl">Laundry Kita</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-white/80 transition-all hover:text-white hover:bg-white/10",
                  pathname.startsWith(link.href) && link.href !== "/dashboard" ? "bg-white/20 text-white" : pathname === "/dashboard" && link.href === "/dashboard" ? "bg-white/20 text-white" : "",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;