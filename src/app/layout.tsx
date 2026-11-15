import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mocha & Co. — Kopi Nusantara & Perlengkapan Seduh",
    template: "%s · Mocha & Co.",
  },
  description:
    "Belanja biji kopi, kopi bubuk, drip bag, dan alat seduh pilihan. Pengalaman belanja kopi yang hangat dan mudah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
