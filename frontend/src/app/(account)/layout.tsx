import { AccountNav } from "@/components/account-nav";
import { RequireAuth } from "@/components/require-auth";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <RequireAuth>
          <div className="container-page grid gap-8 py-12 lg:grid-cols-[240px_1fr]">
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <AccountNav />
            </aside>
            <div className="min-w-0">{children}</div>
          </div>
        </RequireAuth>
      </main>
      <SiteFooter />
    </div>
  );
}
