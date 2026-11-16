import { Suspense } from "react";
import { CatalogView } from "@/components/catalog-view";
import { Skeleton } from "@/components/ui/skeleton";

function CatalogFallback() {
  return (
    <div className="container-page py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-2/3 max-w-xl" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      <Skeleton className="mt-8 h-20 w-full rounded-[24px]" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogView />
    </Suspense>
  );
}
