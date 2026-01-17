"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth/get-user";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  Wrench,
  Cog,
  Users,
} from "lucide-react";

interface SidebarProps {
  user: AuthUser;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Services", href: "/dashboard/services", icon: Wrench, superAdminOnly: true },
  { name: "Parts", href: "/dashboard/parts", icon: Cog, superAdminOnly: true },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, superAdminOnly: true },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(
    (item) => !item.superAdminOnly || user.role === "super_admin"
  );

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.webp"
            alt="Benz Automobile"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="text-lg font-semibold text-slate-900">
            Benz Automobile
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-50 text-amber-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
            <span className="text-sm font-medium text-slate-600">
              {user.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.email}
            </p>
            <p className="text-xs text-slate-500 capitalize">{user.role.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

