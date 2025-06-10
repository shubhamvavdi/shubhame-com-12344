import { Link, useLocation } from "wouter";
import { BarChart3, Package, ShoppingBag, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const [location] = useLocation();

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm h-screen">
      <div className="p-6">
        <Link href="/">
          <h2 className="text-xl font-bold text-primary cursor-pointer">
            Admin Panel
          </h2>
        </Link>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start px-6 py-3 ${
                  isActive
                    ? "bg-blue-50 border-r-2 border-primary text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
