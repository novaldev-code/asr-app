import { AccountOrderDetail } from "@/components/account-order-detail";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <AccountOrderDetail orderNumber={orderNumber} />;
}
