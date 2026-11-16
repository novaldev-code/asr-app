"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/data";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function PaymentProofUpload({
  orderNumber,
  disabled = false,
  onUploaded,
}: {
  orderNumber: string;
  disabled?: boolean;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const submitPaymentProof = useDataStore((state) => state.submitPaymentProof);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      toast.error("Format harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Ukuran file maksimal 2 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return url;
    });
    setFileName(file.name);
    const result = await submitPaymentProof(orderNumber, file);
    if (result.ok) {
      toast.success("Bukti pembayaran diunggah. Menunggu verifikasi admin.");
      onUploaded?.();
    } else {
      toast.error(result.message ?? "Gagal mengunggah bukti.");
    }
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative h-48 w-full overflow-hidden rounded-[10px] border border-border">
          <Image
            src={preview}
            alt="Pratinjau bukti pembayaran"
            fill
            unoptimized
            className="object-contain bg-carbon"
          />
        </div>
      ) : null}
      {fileName ? (
        <p className="text-xs text-ash">
          File terpilih: <span className="font-medium text-bone">{fileName}</span>
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload /> Pilih bukti pembayaran
      </Button>
      <p className="text-xs text-ash">
        JPG, PNG, atau WebP. Maksimal 2 MB.
      </p>
    </div>
  );
}
