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
    <nav className="flex gap-1 overflow-x-auto rounded-[24px] border border-border bg-carbon p-1.5 lg:flex-col">
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
      {user?.role === "admin" ? (
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium text-fog transition-colors hover:bg-carbon hover:text-bone"
        >
          <LayoutDashboard className="size-4" /> Admin
        </Link>
      ) : null}
    </nav>
  );
}
