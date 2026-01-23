"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth/get-user";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Wrench,
  Cog,
  Users,
  FolderTree,
  UserCog,
  Menu,
  X,
  DollarSign,
} from "lucide-react";

interface MobileSidebarProps {
  user: AuthUser;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Categories", href: "/dashboard/categories", icon: FolderTree, superAdminOnly: true },
  { name: "Services", href: "/dashboard/services", icon: Wrench, superAdminOnly: true },
  { name: "Parts", href: "/dashboard/parts", icon: Cog, superAdminOnly: true },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Sales", href: "/dashboard/sales", icon: DollarSign },
  { name: "Admins", href: "/dashboard/admins", icon: UserCog, superAdminOnly: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, superAdminOnly: true },
];

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filteredNavigation = navigation.filter(
    (item) => !item.superAdminOnly || user.role === "super_admin"
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-slate-200 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <img
              src="/logo.webp"
              alt="Benz Automobile"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-lg font-semibold text-slate-900">
              Benz Automobile
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
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

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
              <span className="text-sm font-medium text-slate-600">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.name || user.email}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
