"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Maaf, ada masalah saat memuat halaman ini. Silakan coba lagi.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">Kode: {error.digest}</p>
        ) : null}
        <Button className="mt-6 rounded-full" onClick={reset}>
          <RotateCcw /> Coba lagi
        </Button>
      </div>
    </div>
  );
}
