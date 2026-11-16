import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
} from "@/lib/constants";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] uppercase", ORDER_STATUS_CLASS[status])}
    >
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] uppercase", PAYMENT_STATUS_CLASS[status])}
    >
      {PAYMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
