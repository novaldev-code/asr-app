import { OrderSuccessView } from "@/components/order-success-view";

export const metadata = {
  title: "Pesanan berhasil",
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <OrderSuccessView orderNumber={orderNumber} />;
}
