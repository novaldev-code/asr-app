"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cartCount } from "@/lib/store/cart";
import { useCartStore } from "@/lib/store/cart";
import { useSessionStore } from "@/lib/store/session";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Katalog" },
  { href: "/cart", label: "Keranjang" },
  { href: "/account", label: "Akun" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);
  const items = useCartStore((state) => state.items);
  const count = mounted ? cartCount(items) : 0;

  async function handleLogout() {
    await logout();
    useCartStore.getState().reset();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-background/75 backdrop-blur-md">
      <div className="container-page grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center">
          <Logo />
        </div>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-normal transition-colors",
                  active
                    ? "text-bone after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-bone"
                    : "text-fog hover:text-bone",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-1.5">
          <Link
            href="/cart"
            className="relative inline-flex size-9 items-center justify-center rounded-[10px] text-bone transition-colors hover:bg-carbon"
            aria-label="Buka keranjang"
          >
            <ShoppingBag className="size-4" />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-bone px-1.5 py-0.5 text-[10px] font-semibold text-pitch">
                {count}
              </span>
            ) : null}
          </Link>

          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-border bg-transparent px-2.5 text-sm font-medium text-bone transition-colors hover:bg-carbon">
                <span className="flex size-6 items-center justify-center rounded-full bg-graphite text-xs font-semibold text-bone">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  {user.name.split(" ")[0]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm font-medium text-bone">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs font-normal text-ash">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  <UserRound /> Akun Saya
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/account/orders")}>
                  <Package /> Pesanan Saya
                </DropdownMenuItem>
                {user.role === "admin" ? (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <LayoutDashboard /> Dashboard Admin
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="hidden rounded-full px-4 sm:inline-flex"
            >
              Masuk
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Buka menu navigasi"
              className="inline-flex size-9 items-center justify-center rounded-[10px] border border-border text-bone transition-colors hover:bg-carbon md:hidden"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-border bg-carbon">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-4" aria-label="Navigasi mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-border/30 py-3 text-sm font-medium text-fog transition-colors hover:text-bone"
                  >
                    {link.label}
                  </Link>
                ))}
                {user?.role === "admin" ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-border/30 py-3 text-sm font-medium text-fog transition-colors hover:text-bone"
                  >
                    Dashboard Admin
                  </Link>
                ) : null}
              </nav>
              <div className="mt-auto border-t border-border/40 p-4">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut /> Keluar
                  </Button>
                ) : (
                  <Button
                    className="w-full rounded-full"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/login");
                    }}
                  >
                    Masuk
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
