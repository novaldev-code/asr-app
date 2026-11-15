"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveAssetUrl } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const FALLBACK = "/placeholder.svg";

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const resolved = resolveAssetUrl(src) ?? FALLBACK;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = failedSource === resolved ? FALLBACK : resolved;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={source}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        onError={() => setFailedSource(resolved)}
      />
    </div>
  );
}
