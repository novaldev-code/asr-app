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
    <nav className="flex gap-1 overflow-x-auto rounded-[24px] border border-border bg-carbon p-1.5 lg:flex-col">
      <div className="hidden items-center gap-2 px-3 py-2 lg:flex">
        <span className="flex size-7 items-center justify-center rounded-[10px] bg-bone text-pitch">
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
              "inline-flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-graphite text-bone"
                : "text-fog hover:bg-carbon hover:text-bone",
            )}
          >
            <link.icon className="size-4" /> {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
