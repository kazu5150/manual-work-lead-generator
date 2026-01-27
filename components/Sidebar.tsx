"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Search,
  Globe,
  Mail,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, Suspense } from "react";

const menuItems = [
  {
    label: "ダッシュボード",
    href: "/",
    icon: LayoutDashboard,
    status: null,
  },
  {
    label: "全企業",
    href: "/companies",
    icon: Building2,
    status: null,
  },
  {
    label: "未分析",
    href: "/companies?status=pending",
    icon: Search,
    status: "pending",
    color: "text-gray-600",
  },
  {
    label: "HP取得済み",
    href: "/companies?status=scraped",
    icon: Globe,
    status: "scraped",
    color: "text-green-600",
  },
  {
    label: "メール作成済み",
    href: "/companies?status=emailed",
    icon: Mail,
    status: "emailed",
    color: "text-purple-600",
  },
];

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status");
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item: (typeof menuItems)[0]) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    if (item.href === "/companies" && !item.status) {
      return pathname === "/companies" && !currentStatus;
    }
    if (item.status) {
      return pathname === "/companies" && currentStatus === item.status;
    }
    return false;
  };

  return (
    <aside
      className={cn(
        "bg-card border-r h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    active ? "" : item.color
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside className="bg-card border-r h-[calc(100vh-4rem)] sticky top-16 w-56">
          <div className="p-4">
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-9 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          </div>
        </aside>
      }
    >
      <SidebarContent />
    </Suspense>
  );
}
