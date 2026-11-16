import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  display = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  display?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-[0.2em] text-ash uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            display
              ? "font-serif text-4xl leading-[1.1] tracking-[-0.036em] text-bone sm:text-5xl"
              : "text-2xl font-medium tracking-[-0.02em] text-bone sm:text-3xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-fog">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
