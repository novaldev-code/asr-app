import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.union([
    z.literal(""),
    z
      .string()
      .min(9, "Nomor telepon minimal 9 digit")
      .max(16, "Nomor telepon terlalu panjang")
      .regex(/^[0-9+\-\s]+$/, "Nomor telepon hanya boleh berisi angka"),
  ]),
});

export const addressSchema = z.object({
  recipientName: z.string().min(2, "Nama penerima minimal 2 karakter"),
  phone: z
    .string()
    .min(9, "Nomor telepon minimal 9 digit")
    .max(16, "Nomor telepon terlalu panjang")
    .regex(/^[0-9+\-\s]+$/, "Nomor telepon hanya boleh berisi angka"),
  addressLine: z.string().min(8, "Alamat minimal 8 karakter"),
  city: z.string().min(2, "Kota/kabupaten wajib diisi"),
  province: z.string().min(2, "Provinsi wajib dipilih"),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
});

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  price: z.number().int("Harga harus bilangan bulat").min(0, "Harga tidak boleh negatif"),
  stock: z.number().int("Stok harus bilangan bulat").min(0, "Stok tidak boleh negatif"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  imageUrl: z
    .string()
    .trim()
    .url("URL gambar tidak valid")
    .or(z.literal(""))
    .optional(),
  isActive: z.boolean(),
  featured: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().max(200, "Deskripsi maksimal 200 karakter").optional(),
});

export const shippingSchema = z.object({
  province: z.string().min(2, "Provinsi wajib diisi"),
  cost: z.number().int("Ongkir harus bilangan bulat").min(0, "Ongkir tidak boleh negatif"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type ProductValues = z.infer<typeof productSchema>;
export type CategoryValues = z.infer<typeof categorySchema>;
export type ShippingValues = z.infer<typeof shippingSchema>;
