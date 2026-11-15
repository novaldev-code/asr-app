import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("font-semibold tabular-nums", className)}>
      {formatCurrency(value)}
    </span>
  );
}
