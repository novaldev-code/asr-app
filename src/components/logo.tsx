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
      <span className="relative flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <span className="font-heading text-lg leading-none">M</span>
        <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-caramel ring-2 ring-background" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-semibold tracking-tight">
          {STORE_NAME}
        </span>
        <span className="mt-0.5 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Coffee &amp; Goods
        </span>
      </span>
    </Link>
  );
}
