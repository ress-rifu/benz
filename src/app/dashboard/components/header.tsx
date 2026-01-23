"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/lib/auth/get-user";
import { LogOut } from "lucide-react";
import { logout } from "./actions";
import { MobileSidebar } from "./mobile-sidebar";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/lib/language/language-context";
import Link from "next/link";

interface HeaderProps {
  user: AuthUser;
}

export function Header({ user }: HeaderProps) {
  const { t } = useLanguage();
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 print:hidden">
      {/* Left side - Mobile menu button */}
      <div className="flex items-center gap-3 lg:hidden">
        <MobileSidebar user={user} />
      </div>

      {/* Center - Logo (mobile only) */}
      <Link 
        href="/dashboard" 
        className="flex items-center gap-2 lg:hidden absolute left-1/2 transform -translate-x-1/2"
      >
        <img
          src="/logo.webp"
          alt="Benz Automobile"
          className="h-8 w-8 rounded-lg object-contain"
        />
      </Link>

      {/* Spacer for desktop */}
      <div className="hidden lg:block flex-1" />

      {/* Right side - Language toggle and User menu */}
      <div className="flex items-center gap-2">
        <LanguageToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
              <span className="text-sm font-medium text-slate-600">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
            </div>
            <span className="hidden text-sm font-medium text-slate-700 md:inline-block">
              {user.name || user.email}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.name || "My Account"}</DropdownMenuLabel>
          <DropdownMenuItem className="text-slate-500" disabled>
            @{user.username}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-slate-500" disabled>
            <span className="capitalize">{user.role.replace("_", " ")}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("common.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}

