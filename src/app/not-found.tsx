import Link from "next/link";
import { Coffee, Home, Search } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Coffee className="size-6" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-caramel">
            Error 404
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Halaman tidak ditemukan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sepertinya halaman yang Anda cari sudah dipindahkan atau tidak pernah ada.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button className="rounded-full" render={<Link href="/" />}>
              <Home /> Kembali ke beranda
            </Button>
            <Button variant="outline" className="rounded-full" render={<Link href="/products" />}>
              <Search /> Lihat katalog
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
