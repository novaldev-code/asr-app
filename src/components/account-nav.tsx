"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Package, UserRound } from "lucide-react";
import { useSessionStore } from "@/lib/store/session";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Ringkasan", icon: UserRound },
  { href: "/account/addresses", label: "Alamat", icon: MapPin },
  { href: "/account/orders", label: "Pesanan", icon: Package },
];

export function AccountNav() {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 lg:flex-col">
      {LINKS.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === "/account"
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
      {user?.role === "admin" ? (
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-mocha transition-colors hover:bg-secondary"
        >
          <LayoutDashboard className="size-4" /> Admin
        </Link>
      ) : null}
    </nav>
  );
}
