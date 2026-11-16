import { CheckoutView } from "@/components/checkout-view";
import { RequireAuth } from "@/components/require-auth";

export const metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutView />
    </RequireAuth>
  );
}
