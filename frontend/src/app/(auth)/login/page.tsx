import { Suspense } from "react";
import { LoginForm } from "@/components/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-[24px]" />}>
      <LoginForm />
    </Suspense>
  );
}
