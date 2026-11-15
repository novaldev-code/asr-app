"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  MapPin,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCartDetails } from "@/hooks/use-cart-details";
import { fetchShippingQuote } from "@/lib/api/catalog";
import {
  DEFAULT_SHIPPING_COST,
  PROVINCES,
  PAYMENT_METHOD_LABEL,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";
import {
  addressSchema,
  checkoutSchema,
  type AddressValues,
  type CheckoutValues,
} from "@/lib/validators";
import { cn } from "@/lib/utils";

const EMPTY_ADDRESS: AddressValues = {
  recipientName: "",
  phone: "",
  addressLine: "",
  city: "",
  province: "DKI Jakarta",
  postalCode: "",
};

export function CheckoutView() {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const addresses = useDataStore((state) => state.addresses);
  const loadAddresses = useDataStore((state) => state.loadAddresses);
  const placeOrder = useDataStore((state) => state.placeOrder);
  const saveAddress = useDataStore((state) => state.saveAddress);
  const clearCart = useCartStore((state) => state.clear);
  const { lines, subtotal, count } = useCartDetails();
  const [quote, setQuote] = useState<{ cost: number; isDefault: boolean } | null>(
    null,
  );

  useEffect(() => {
    void loadAddresses().catch(() => {
      // address list stays empty when the request fails
    });
  }, [loadAddresses]);

  const userAddresses = useMemo(
    () => addresses.filter((address) => address.userId === user?.id),
    [addresses, user?.id],
  );

  const [addressChoice, setAddressChoice] = useState<string>("");
  const defaultAddress =
    userAddresses.find((address) => address.isDefault) ?? userAddresses[0];
  const selectedAddressId =
    addressChoice === "new" ||
    userAddresses.some((address) => address.id === addressChoice)
      ? addressChoice
      : (defaultAddress?.id ?? "new");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY_ADDRESS,
    mode: "onTouched",
  });

  const checkoutForm = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "bank_transfer", notes: "" },
    mode: "onTouched",
  });

  const selectedAddress = userAddresses.find(
    (address) => address.id === selectedAddressId,
  );
  const newProvince = useWatch({
    control: addressForm.control,
    name: "province",
  });
  const province =
    selectedAddressId === "new"
      ? newProvince || "DKI Jakarta"
      : selectedAddress?.province ?? "DKI Jakarta";

  useEffect(() => {
    let active = true;
    void fetchShippingQuote(province)
      .then((data) => {
        if (active) setQuote({ cost: data.cost, isDefault: data.isDefault });
      })
      .catch(() => {
        if (active) setQuote(null);
      });
    return () => {
      active = false;
    };
  }, [province]);

  const shippingCost = quote?.cost ?? DEFAULT_SHIPPING_COST;
  const total = subtotal + shippingCost;
  const paymentMethod = useWatch({
    control: checkoutForm.control,
    name: "paymentMethod",
  });

  if (lines.length === 0) {
    return (
      <div className="container-page py-14">
        <EmptyState
          icon={<ShoppingBag className="size-5" />}
          title="Keranjang Anda kosong"
          description="Tambahkan produk terlebih dahulu sebelum melakukan checkout."
          action={
            <Button className="rounded-full" render={<Link href="/products" />}>
              Jelajahi katalog
            </Button>
          }
        />
      </div>
    );
  }

  async function handleConfirm() {
    if (!user) return;
    if (selectedAddressId === "new") {
      const valid = await addressForm.trigger();
      if (!valid) {
        setConfirmOpen(false);
        toast.error("Periksa kembali alamat pengiriman Anda.");
        return;
      }
    }

    setSubmitting(true);
    try {
      let snapshot: {
        addressId: string | null;
        recipientName: string;
        phone: string;
        addressLine: string;
        city: string;
        province: string;
        postalCode: string;
      };

      if (selectedAddressId === "new") {
        const values = addressForm.getValues();
        const saved = await saveAddress(values, user.id);
        snapshot = { ...values, addressId: saved.id };
      } else if (selectedAddress) {
        snapshot = {
          addressId: selectedAddress.id,
          recipientName: selectedAddress.recipientName,
          phone: selectedAddress.phone,
          addressLine: selectedAddress.addressLine,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postalCode: selectedAddress.postalCode,
        };
      } else {
        toast.error("Alamat pengiriman tidak ditemukan.");
        setConfirmOpen(false);
        return;
      }

      const values = checkoutForm.getValues();
      const result = await placeOrder({
        userId: user.id,
        lines: lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
        address: snapshot,
        paymentMethod: values.paymentMethod,
        notes: values.notes ?? "",
      });

      if (!result.ok) {
        toast.error(result.message ?? "Pesanan gagal dibuat.");
        setConfirmOpen(false);
        return;
      }

      await clearCart();
      setConfirmOpen(false);
      toast.success("Pesanan berhasil dibuat.");
      router.push(`/checkout/success/${result.order.orderNumber}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="Checkout"
        title="Selesaikan pesanan Anda"
        description="Lengkapi alamat, pilih metode pembayaran, lalu tinjau ringkasan sebelum pesanan dibuat."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-caramel" />
              <h2 className="font-heading text-lg font-semibold">Alamat pengiriman</h2>
            </div>
            <div className="mt-4 space-y-3">
              {userAddresses.map((address) => {
                const active = selectedAddressId === address.id;
                return (
                  <label
                    key={address.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                      active
                        ? "border-primary bg-secondary/50"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1 accent-[var(--color-primary)]"
                      checked={active}
                      onChange={() => setAddressChoice(address.id)}
                    />
                    <div className="text-sm">
                      <p className="font-medium">
                        {address.recipientName}
                        {address.isDefault ? (
                          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                            Utama
                          </span>
                        ) : null}
                      </p>
                      <p className="text-muted-foreground">{address.phone}</p>
                      <p className="mt-1 text-muted-foreground">
                        {address.addressLine}, {address.city}, {address.province}{" "}
                        {address.postalCode}
                      </p>
                    </div>
                  </label>
                );
              })}

              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  selectedAddressId === "new"
                    ? "border-primary bg-secondary/50"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name="address"
                  className="accent-[var(--color-primary)]"
                  checked={selectedAddressId === "new"}
                  onChange={() => setAddressChoice("new")}
                />
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Plus className="size-4" /> Gunakan alamat baru
                </span>
              </label>

              {selectedAddressId === "new" ? (
                <div className="grid gap-4 rounded-xl border border-dashed border-border p-4 sm:grid-cols-2">
                  <Field
                    label="Nama penerima"
                    htmlFor="recipientName"
                    error={addressForm.formState.errors.recipientName?.message}
                  >
                    <Input
                      id="recipientName"
                      placeholder="Nama lengkap"
                      {...addressForm.register("recipientName")}
                    />
                  </Field>
                  <Field
                    label="Nomor telepon"
                    htmlFor="phone"
                    error={addressForm.formState.errors.phone?.message}
                  >
                    <Input
                      id="phone"
                      placeholder="08xxxxxxxxxx"
                      {...addressForm.register("phone")}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field
                      label="Alamat lengkap"
                      htmlFor="addressLine"
                      error={addressForm.formState.errors.addressLine?.message}
                    >
                      <Textarea
                        id="addressLine"
                        placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                        {...addressForm.register("addressLine")}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Kota / kabupaten"
                    htmlFor="city"
                    error={addressForm.formState.errors.city?.message}
                  >
                    <Input id="city" placeholder="Jakarta Selatan" {...addressForm.register("city")} />
                  </Field>
                  <Field
                    label="Provinsi"
                    htmlFor="province"
                    error={addressForm.formState.errors.province?.message}
                  >
                    <select
                      id="province"
                      className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      {...addressForm.register("province")}
                    >
                      {PROVINCES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Kode pos"
                    htmlFor="postalCode"
                    error={addressForm.formState.errors.postalCode?.message}
                  >
                    <Input
                      id="postalCode"
                      inputMode="numeric"
                      placeholder="12130"
                      {...addressForm.register("postalCode")}
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-caramel" />
              <h2 className="font-heading text-lg font-semibold">Metode pembayaran</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["bank_transfer", "cod"] as const).map((method) => {
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() =>
                      checkoutForm.setValue("paymentMethod", method, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-secondary/50"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {method === "cod" ? (
                        <Banknote className="size-4" />
                      ) : (
                        <CreditCard className="size-4" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">
                        {PAYMENT_METHOD_LABEL[method]}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {method === "cod"
                          ? "Bayar saat pesanan tiba. Status lunas diatur admin setelah selesai."
                          : "Unggah bukti transfer dari halaman pesanan. Diverifikasi admin."}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-caramel" />
              <h2 className="font-heading text-lg font-semibold">Catatan</h2>
            </div>
            <div className="mt-4">
              <Label htmlFor="notes" className="text-sm">
                Catatan pesanan (opsional)
              </Label>
              <Textarea
                id="notes"
                className="mt-1.5"
                placeholder="Contoh: tolong bungkus sebagai hadiah"
                {...checkoutForm.register("notes")}
              />
              {checkoutForm.formState.errors.notes ? (
                <p className="mt-1 text-xs text-destructive">
                  {checkoutForm.formState.errors.notes.message}
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-semibold">Ringkasan pesanan</h2>
          <ul className="mt-4 space-y-3">
            {lines.map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {quantity} × {formatCurrency(product.price)}
                  </p>
                </div>
                <Price value={lineTotal} className="text-sm" />
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal ({count} item)</dt>
              <dd>
                <Price value={subtotal} />
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Ongkir ke {province}
              </dt>
              <dd>
                <Price value={shippingCost} />
              </dd>
            </div>
            {quote ? (
              <p className="text-xs text-muted-foreground">
                Tarif {quote.isDefault ? "default" : "provinsi"} ·{" "}
                {formatCurrency(quote.cost)}
              </p>
            ) : null}
          </dl>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <Price value={total} className="text-lg text-mocha" />
          </div>
          <Button
            size="lg"
            className="mt-5 w-full rounded-full"
            onClick={() => setConfirmOpen(true)}
          >
            Buat pesanan <ArrowRight />
          </Button>
          <Button
            variant="ghost"
            className="mt-2 w-full rounded-full"
            render={<Link href="/cart" />}
          >
            Kembali ke keranjang
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Dengan membuat pesanan, stok akan dikurangi secara otomatis.
          </p>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi pesanan</DialogTitle>
            <DialogDescription>
              Periksa kembali ringkasan berikut. Pesanan akan dibuat dan stok
              langsung dikurangi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah item</span>
              <span>{count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ongkir</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode</span>
              <span>{PAYMENT_METHOD_LABEL[paymentMethod]}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              className="rounded-full"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Ya, buat pesanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
