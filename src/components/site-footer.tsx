import Link from "next/link";
import { Logo } from "@/components/logo";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {STORE_TAGLINE} Kami meracik kopi Nusantara dan perlengkapan seduh
            pilihan untuk menemani ritual harian Anda.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo MVP — seluruh data disimpan di perangkat Anda.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
            Belanja
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-foreground" href="/products">
                Katalog
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/cart">
                Keranjang
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/account/orders">
                Pesanan
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/account/addresses">
                Alamat
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
            Bantuan
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-foreground" href="/account">
                Akun saya
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/account#demo">
                Reset data demo
              </Link>
            </li>
            <li>
              <span className="block">Senin–Sabtu, 08.00–20.00</span>
            </li>
            <li>
              <span className="block">halo@mochaco.test</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {STORE_NAME}. Semua hak dilindungi.
          </p>
          <p>Dibuat dengan Next.js, Tailwind CSS, dan shadcn/ui.</p>
        </div>
      </div>
    </footer>
  );
}
