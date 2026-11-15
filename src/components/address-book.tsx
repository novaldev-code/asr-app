"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROVINCES } from "@/lib/constants";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";
import { addressSchema, type AddressValues } from "@/lib/validators";
import type { Address } from "@/lib/types";

const EMPTY_ADDRESS: AddressValues = {
  recipientName: "",
  phone: "",
  addressLine: "",
  city: "",
  province: "DKI Jakarta",
  postalCode: "",
};

export function AddressBook() {
  const user = useSessionStore((state) => state.user)!;
  const addresses = useDataStore((state) => state.addresses);
  const addressesLoaded = useDataStore((state) => state.addressesLoaded);
  const loadAddresses = useDataStore((state) => state.loadAddresses);
  const saveAddress = useDataStore((state) => state.saveAddress);
  const setDefaultAddress = useDataStore((state) => state.setDefaultAddress);
  const removeAddress = useDataStore((state) => state.removeAddress);

  useEffect(() => {
    void loadAddresses().catch(() => {
      // empty state is shown when the request fails
    });
  }, [loadAddresses]);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const myAddresses = addresses.filter((address) => address.userId === user.id);

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY_ADDRESS,
  });

  function openCreate() {
    setEditingId(null);
    form.reset(EMPTY_ADDRESS);
    setOpen(true);
  }

  function openEdit(address: Address) {
    setEditingId(address.id);
    form.reset({
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
    });
    setOpen(true);
  }

  async function onSubmit(values: AddressValues) {
    try {
      await saveAddress(values, user.id, editingId ?? undefined);
      toast.success(editingId ? "Alamat diperbarui." : "Alamat baru ditambahkan.");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Alamat gagal disimpan.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Akun"
        title="Alamat pengiriman"
        description="Simpan alamat agar checkout berikutnya lebih cepat. Satu alamat dapat ditandai sebagai utama."
        action={
          <Button className="rounded-full" onClick={openCreate}>
            <Plus /> Tambah alamat
          </Button>
        }
      />

      {!addressesLoaded ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Memuat alamat…</p>
        </div>
      ) : myAddresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="size-5" />}
          title="Belum ada alamat tersimpan"
          description="Tambahkan alamat pertama Anda untuk mempermudah checkout."
          action={
            <Button className="rounded-full" onClick={openCreate}>
              <Plus /> Tambah alamat
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {myAddresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{address.recipientName}</p>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                </div>
                {address.isDefault ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                    <Star className="size-3" /> Utama
                  </span>
                ) : null}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {address.addressLine}
                <br />
                {address.city}, {address.province} {address.postalCode}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(address)}>
                  <Pencil /> Ubah
                </Button>
                {!address.isDefault ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={async () => {
                      const result = await setDefaultAddress(user.id, address.id);
                      if (result.ok) {
                        toast.success("Alamat utama diperbarui.");
                      } else {
                        toast.error(result.message ?? "Alamat gagal diubah.");
                      }
                    }}
                  >
                    <Star /> Jadikan utama
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    const result = await removeAddress(address.id);
                    if (result.ok) {
                      toast.success("Alamat dihapus.");
                    } else {
                      toast.error(result.message ?? "Alamat gagal dihapus.");
                    }
                  }}
                >
                  <Trash2 /> Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Ubah alamat" : "Tambah alamat"}</DialogTitle>
            <DialogDescription>
              Lengkapi data penerima dan alamat pengiriman.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="address-recipient">Nama penerima</Label>
              <Input id="address-recipient" {...form.register("recipientName")} />
              {form.formState.errors.recipientName ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.recipientName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address-phone">Nomor telepon</Label>
              <Input id="address-phone" placeholder="08xxxxxxxxxx" {...form.register("phone")} />
              {form.formState.errors.phone ? (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address-line">Alamat lengkap</Label>
              <Textarea id="address-line" {...form.register("addressLine")} />
              {form.formState.errors.addressLine ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.addressLine.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address-city">Kota / kabupaten</Label>
              <Input id="address-city" {...form.register("city")} />
              {form.formState.errors.city ? (
                <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address-province">Provinsi</Label>
              <select
                id="address-province"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                {...form.register("province")}
              >
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {form.formState.errors.province ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.province.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address-postal">Kode pos</Label>
              <Input id="address-postal" inputMode="numeric" {...form.register("postalCode")} />
              {form.formState.errors.postalCode ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.postalCode.message}
                </p>
              ) : null}
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="rounded-full">
                Simpan alamat
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
