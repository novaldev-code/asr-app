"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Save, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PROVINCES } from "@/lib/constants";
import { useDataStore } from "@/lib/store/data";
import { shippingSchema, type ShippingValues } from "@/lib/validators";

export function AdminShipping() {
  const rates = useDataStore((state) => state.shippingRates);
  const loadShippingRates = useDataStore((state) => state.loadShippingRates);
  const saveShippingRate = useDataStore((state) => state.saveShippingRate);
  const setDefaultShippingRate = useDataStore((state) => state.setDefaultShippingRate);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadShippingRates()
      .catch(() => {
        // table falls back to empty state
      })
      .finally(() => setLoading(false));
  }, [loadShippingRates]);

  const form = useForm<ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { province: PROVINCES[0], cost: 0 },
  });

  async function onSubmit(values: ShippingValues) {
    const result = await saveShippingRate(values);
    if (result.ok) {
      toast.success(
        editing ? "Tarif ongkir diperbarui." : "Tarif ongkir provinsi disimpan.",
      );
      setEditing(false);
      form.reset({ province: PROVINCES[0], cost: 0 });
    } else {
      toast.error(result.message ?? "Gagal menyimpan tarif.");
    }
  }

  const sorted = [...rates].sort((a, b) => a.province.localeCompare(b.province));
  const defaultRate = rates.find((rate) => rate.isDefault);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[24px] border border-border bg-carbon p-10 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-graphite border-t-bone" />
        <p className="text-sm text-fog">Memuat tarif ongkir…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        display
        eyebrow="Admin"
        title="Ongkos kirim"
        description="Atur tarif pengiriman per provinsi. Satu tarif ditandai sebagai default untuk provinsi tanpa tarif khusus."
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-[24px] border border-border bg-carbon p-5">
          <h2 className="flex items-center gap-2 font-serif text-2xl tracking-[-0.02em]">
            {editing ? <Pencil className="size-4 text-fog" /> : <Plus className="size-4 text-fog" />}
            {editing ? "Ubah tarif" : "Tambah / perbarui tarif"}
          </h2>
          <p className="mt-1 text-sm text-fog">
            Menyimpan provinsi yang sama akan memperbarui tarif yang ada.
          </p>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="shipping-province">Provinsi</Label>
              <select
                id="shipping-province"
                className="h-10 w-full rounded-[24px] border border-border bg-carbon px-4 text-sm text-bone outline-none transition-colors focus-visible:border-bone"
                {...form.register("province")}
              >
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {form.formState.errors.province ? (
                <p className="text-xs text-fog">
                  {form.formState.errors.province.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipping-cost">Ongkir (Rp)</Label>
              <Input
                id="shipping-cost"
                type="number"
                min={0}
                {...form.register("cost", { valueAsNumber: true })}
              />
              {form.formState.errors.cost ? (
                <p className="text-xs text-fog">{form.formState.errors.cost.message}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 rounded-full">
                <Save /> Simpan tarif
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setEditing(false);
                    form.reset({ province: PROVINCES[0], cost: 0 });
                  }}
                >
                  Batal
                </Button>
              ) : null}
            </div>
          </form>

          <div className="mt-5 rounded-[10px] border border-border/50 bg-background/50 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Truck className="size-4 text-fog" /> Tarif default
            </p>
            <p className="mt-1 text-ash">
              {defaultRate
                ? `${defaultRate.province} · ${new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(defaultRate.cost)}`
                : "Belum ada tarif default."}
            </p>
          </div>
        </section>

        <div className="rounded-[24px] border border-border bg-carbon">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provinsi</TableHead>
                <TableHead className="text-right">Ongkir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="text-sm font-medium">{rate.province}</TableCell>
                  <TableCell className="text-right text-sm">
                    <Price value={rate.cost} />
                  </TableCell>
                  <TableCell>
                    {rate.isDefault ? (
                      <Badge variant="secondary">Default</Badge>
                    ) : (
                      <span className="text-xs text-ash">Khusus</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {!rate.isDefault ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          onClick={async () => {
                            const result = await setDefaultShippingRate(rate.id);
                            if (result.ok) {
                              toast.success(
                                `${rate.province} menjadi tarif default.`,
                              );
                            } else {
                              toast.error(
                                result.message ?? "Tarif default gagal diubah.",
                              );
                            }
                          }}
                        >
                          <Star /> Default
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() => {
                          setEditing(true);
                          form.reset({ province: rate.province, cost: rate.cost });
                        }}
                      >
                        <Pencil />
                        <span className="sr-only">Ubah</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs text-ash">
        {rates.length} tarif provinsi tersimpan.
      </p>
    </div>
  );
}
