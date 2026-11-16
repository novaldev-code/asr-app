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
        <div className="max-w-lg text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-[10px] border border-border bg-carbon text-fog">
            <Coffee className="size-6" />
          </span>
          <p className="mt-6 text-[11px] font-medium tracking-[0.22em] text-ash uppercase">
            Error 404
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.02] tracking-[-0.04em]">Halaman tidak ditemukan</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog">
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
