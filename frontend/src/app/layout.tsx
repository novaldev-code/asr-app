import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

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
    <html
      lang="id"
      className={`${geist.variable} ${playfair.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
