import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="container-page flex h-20 items-center justify-between">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-fog transition-colors hover:text-bone"
        >
          <ArrowLeft className="size-4" /> Kembali ke toko
        </Link>
      </div>
      <main className="container-page grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_minmax(380px,440px)] lg:gap-20">
        <section className="hidden max-w-xl lg:block">
          <p className="text-[11px] font-medium tracking-[0.22em] text-ash uppercase">
            Akun Mocha &amp; Co.
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[0.98] tracking-[-0.036em] text-bone">
            Ritual kopi, <em className="font-serif italic">tersimpan rapi.</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-fog">
            Masuk untuk menyimpan alamat, memantau pesanan, dan melanjutkan
            ritual seduh tanpa mengulang langkah yang sama.
          </p>
          <div className="mt-10 h-px w-24 bg-border/40" />
          <p className="mt-4 text-sm text-ash">
            Kopi Nusantara · Disangrai mingguan · Dikemas setelah dipesan
          </p>
        </section>
        <div className="w-full max-w-md lg:mx-0">{children}</div>
      </main>
    </div>
  );
}
