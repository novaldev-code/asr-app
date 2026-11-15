"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid2x2,
  LayoutDashboard,
  Package,
  ReceiptText,
  Tags,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pesanan", icon: ReceiptText },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/categories", label: "Kategori", icon: Tags },
  { href: "/admin/shipping", label: "Ongkir", icon: Truck },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 lg:flex-col">
      <div className="hidden items-center gap-2 px-3 py-2 lg:flex">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Grid2x2 className="size-4" />
        </span>
        <span className="font-heading text-sm font-semibold">Admin panel</span>
      </div>
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <link.icon className="size-4" /> {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
