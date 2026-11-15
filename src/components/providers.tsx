"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useCartStore } from "@/lib/store/cart";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await useCartStore.persist.rehydrate();
      const user = await useSessionStore.getState().refresh();
      if (!active) return;

      if (user) {
        await useCartStore.getState().mergeGuest();
      } else {
        await useCartStore.getState().load();
      }

      try {
        await useDataStore.getState().loadCatalog();
      } catch {
        // catalog will be retried by the page that needs it
      }
      if (!active) return;
      useCartStore.getState().clampToStock(useDataStore.getState().products);
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-center" theme="light" richColors />
    </>
  );
}
