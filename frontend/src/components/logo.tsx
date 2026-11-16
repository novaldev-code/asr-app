import Link from "next/link";
import { STORE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={STORE_NAME}
    >
      <span className="flex size-9 items-center justify-center rounded-[10px] border border-border text-bone transition-colors group-hover:bg-carbon">
        <span className="font-serif text-lg leading-none">M</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl tracking-[-0.03em] text-bone">
          {STORE_NAME}
        </span>
        <span className="mt-1 text-[10px] tracking-[0.22em] text-ash uppercase">
          Coffee &amp; Goods
        </span>
      </span>
    </Link>
  );
}
