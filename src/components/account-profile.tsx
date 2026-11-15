"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABEL } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";
import { profileSchema, type ProfileValues } from "@/lib/validators";

export function AccountProfile() {
  const router = useRouter();
  const user = useSessionStore((state) => state.user)!;
  const updateProfile = useSessionStore((state) => state.updateProfile);
  const logout = useSessionStore((state) => state.logout);
  const orders = useDataStore((state) => state.orders);
  const loadMyOrders = useDataStore((state) => state.loadMyOrders);

  useEffect(() => {
    void loadMyOrders().catch(() => {
      // stats stay empty when the request fails
    });
  }, [loadMyOrders]);

  const myOrders = orders.filter((order) => order.userId === user.id);
  const totalSpent = myOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + order.total, 0);
  const activeOrders = myOrders.filter(
    (order) => order.status !== "completed" && order.status !== "cancelled",
  ).length;

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  });

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile(values);
      toast.success("Profil berhasil diperbarui.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Profil gagal diperbarui.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Akun"
        title={`Halo, ${user.name.split(" ")[0]}`}
        description="Kelola profil, alamat, dan pantau pesanan Anda dari satu tempat."
        action={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => router.push("/account/orders")}
          >
            <Package /> Pesanan saya
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total pesanan", value: String(myOrders.length) },
          { label: "Pesanan aktif", value: String(activeOrders) },
          { label: "Total belanja", value: formatCurrency(totalSpent) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-heading text-xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Profil</h2>
            <p className="text-sm text-muted-foreground">
              Perbarui nama dan nomor telepon yang dipakai saat checkout.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {user.role === "admin" ? (
              <ShieldCheck className="size-3.5" />
            ) : (
              <UserRound className="size-3.5" />
            )}
            {ROLE_LABEL[user.role]}
          </span>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nama lengkap</Label>
            <Input id="profile-name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} readOnly disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Nomor telepon</Label>
            <Input id="profile-phone" placeholder="08xxxxxxxxxx" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
          <div className="flex items-end">
            <Button type="submit" className="rounded-full">
              Simpan perubahan
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-dashed border-caramel/50 bg-secondary/30 p-5">
        <h2 className="font-heading text-lg font-semibold">Aksi akun</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola akses akun Anda atau keluar dari sesi ini.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.role === "admin" ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              render={<Link href="/admin" />}
            >
              <LayoutDashboard /> Dashboard admin
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:bg-destructive/10"
            onClick={async () => {
              await logout();
              useCartStore.getState().reset();
              toast.success("Anda telah keluar.");
              router.push("/");
            }}
          >
            <LogOut /> Keluar
          </Button>
        </div>
      </section>
    </div>
  );
}
