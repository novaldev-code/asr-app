import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[24px] border border-border bg-carbon px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-5 flex size-12 items-center justify-center rounded-[10px] border border-border/60 text-fog">
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-medium text-bone">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-fog">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
