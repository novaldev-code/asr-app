import Link from "next/link";
import { Logo } from "@/components/logo";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/30">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-fog">
            {STORE_TAGLINE} Kami meracik kopi Nusantara dan perlengkapan seduh
            pilihan untuk menemani ritual harian Anda.
          </p>
          <p className="mt-4 text-xs text-ash">
            Dikemas setelah dipesan. Disangrai mingguan di Indonesia.
          </p>
        </div>
        <div>
          <h2 className="text-[11px] font-medium tracking-[0.18em] text-ash uppercase">
            Belanja
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ash">
            <li>
              <Link className="transition-colors hover:text-bone" href="/products">
                Katalog
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-bone" href="/cart">
                Keranjang
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-bone" href="/account/orders">
                Pesanan
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-bone" href="/account/addresses">
                Alamat
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-[11px] font-medium tracking-[0.18em] text-ash uppercase">
            Bantuan
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ash">
            <li>
              <Link className="transition-colors hover:text-bone" href="/account">
                Akun saya
              </Link>
            </li>
            <li>
              <span className="block">Senin–Sabtu, 08.00–20.00</span>
            </li>
            <li>
              <a className="transition-colors hover:text-bone" href="mailto:halo@mochaco.test">
                halo@mochaco.test
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/20">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ash sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {STORE_NAME}. Semua hak dilindungi.
          </p>
          <p>Kopi Nusantara, disangrai segar.</p>
        </div>
      </div>
    </footer>
  );
}
