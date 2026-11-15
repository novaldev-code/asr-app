"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useSessionStore } from "@/lib/store/session";
import type { Role } from "@/lib/types";

export function RequireAuth({
  role,
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const mounted = useHasMounted();
  const user = useSessionStore((state) => state.user);
  const status = useSessionStore((state) => state.status);
  const pathname = usePathname();
  const router = useRouter();
  const ready = mounted && status !== "loading";

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }
    if (role && user.role !== role) {
      toast.error(
        role === "admin"
          ? "Halaman ini hanya untuk admin."
          : "Halaman ini tidak dapat diakses dengan peran Anda.",
      );
      router.replace(role === "admin" ? "/" : "/admin");
    }
  }, [ready, user, role, pathname, router]);

  if (!ready || !user || (role && user.role !== role)) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Memeriksa sesi Anda…</p>
        </div>
      </div>
    );
  }

  return children;
}
