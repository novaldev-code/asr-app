import { create } from "zustand";
import {
  createCategory,
  createProduct,
  createShippingRate,
  deleteCategory,
  deleteProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  setDefaultShippingRate as setDefaultShippingRateApi,
  updateCategory,
  updateProduct,
  updateShippingRate,
} from "@/lib/api/admin";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress as setDefaultAddressApi,
  updateAddress,
} from "@/lib/api/addresses";
import { fetchCategories, fetchProducts, fetchShippingRates } from "@/lib/api/catalog";
import {
  cancelMyOrder,
  checkout,
  fetchAdminOrderByNumber,
  fetchAdminOrders,
  fetchAdminDashboard,
  fetchMyOrderByNumber,
  fetchMyOrders,
  updateOrderStatus as updateOrderStatusApi,
  uploadPaymentProof,
  verifyOrderPayment,
  type AdminDashboard,
  type AdminOrder,
} from "@/lib/api/orders";
import { useCartStore } from "@/lib/store/cart";
import type {
  Address,
  Category,
  Order,
  OrderStatus,
  PlaceOrderInput,
  PlaceOrderResult,
  Product,
  Role,
  ShippingRate,
} from "@/lib/types";
import type {
  AddressValues,
  CategoryValues,
  ProductValues,
  ShippingValues,
} from "@/lib/validators";

interface ActionResult {
  ok: boolean;
  message?: string;
}

interface DataState {
  products: Product[];
  categories: Category[];
  shippingRates: ShippingRate[];
  addresses: Address[];
  orders: Order[];
  adminOrders: AdminOrder[];
  dashboard: AdminDashboard | null;
  catalogLoaded: boolean;
  adminCatalogLoaded: boolean;
  addressesLoaded: boolean;
  ordersLoaded: boolean;
  adminOrdersLoaded: boolean;

  loadCatalog: () => Promise<void>;
  loadAdminCatalog: () => Promise<void>;
  loadShippingRates: () => Promise<void>;
  loadAddresses: () => Promise<void>;
  loadMyOrders: () => Promise<void>;
  loadAdminOrders: () => Promise<void>;
  loadDashboard: () => Promise<void>;

  saveProduct: (
    values: ProductValues,
    id?: string,
    file?: File,
  ) => Promise<ActionResult>;
  toggleProductActive: (id: string, isActive: boolean) => Promise<ActionResult>;
  removeProduct: (id: string) => Promise<ActionResult>;
  saveCategory: (values: CategoryValues, id?: string) => Promise<ActionResult>;
  removeCategory: (id: string) => Promise<ActionResult>;
  saveShippingRate: (values: ShippingValues) => Promise<ActionResult>;
  setDefaultShippingRate: (id: string) => Promise<ActionResult>;
  saveAddress: (
    values: AddressValues,
    userId: string,
    id?: string,
  ) => Promise<Address>;
  setDefaultAddress: (userId: string, id: string) => Promise<ActionResult>;
  removeAddress: (id: string) => Promise<ActionResult>;
  placeOrder: (input: PlaceOrderInput) => Promise<PlaceOrderResult>;
  cancelOrder: (
    orderNumber: string,
    role: Role,
    userId: string,
    note?: string,
  ) => Promise<ActionResult>;
  updateOrderStatus: (
    orderNumber: string,
    to: OrderStatus,
    role: Role,
    changedBy: string,
    note?: string,
  ) => Promise<ActionResult>;
  verifyPayment: (
    orderNumber: string,
    decision: "paid" | "rejected",
    changedBy: string,
  ) => Promise<ActionResult>;
  submitPaymentProof: (
    orderNumber: string,
    file: File,
  ) => Promise<ActionResult>;
}

const LIST_LIMIT = 100;

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    items: order.items ?? [],
    history: order.history ?? [],
  };
}

function replaceOrder(orders: Order[], updated: Order): Order[] {
  return orders.map((order) => (order.id === updated.id ? updated : order));
}

export const useDataStore = create<DataState>()((set, get) => ({
  products: [],
  categories: [],
  shippingRates: [],
  addresses: [],
  orders: [],
  adminOrders: [],
  dashboard: null,
  catalogLoaded: false,
  adminCatalogLoaded: false,
  addressesLoaded: false,
  ordersLoaded: false,
  adminOrdersLoaded: false,

  loadCatalog: async () => {
    const [products, categories] = await Promise.all([
      fetchProducts({ limit: LIST_LIMIT }),
      fetchCategories(),
    ]);
    set({
      products: products.data.map((product) => ({
        ...product,
        isActive: product.isActive,
      })),
      categories,
      catalogLoaded: true,
      adminCatalogLoaded: false,
    });
  },

  loadAdminCatalog: async () => {
    const [products, categories] = await Promise.all([
      fetchAdminProducts({ limit: LIST_LIMIT }),
      fetchAdminCategories(),
    ]);
    set({
      products: products.data,
      categories,
      adminCatalogLoaded: true,
      catalogLoaded: false,
    });
  },

  loadShippingRates: async () => {
    set({ shippingRates: await fetchShippingRates() });
  },

  loadAddresses: async () => {
    set({ addresses: await fetchAddresses(), addressesLoaded: true });
  },

  loadMyOrders: async () => {
    const result = await fetchMyOrders({ limit: LIST_LIMIT });
    set({
      orders: result.data.map(normalizeOrder),
      ordersLoaded: true,
    });
  },

  loadAdminOrders: async () => {
    const result = await fetchAdminOrders({ limit: LIST_LIMIT });
    set({
      adminOrders: result.data.map(normalizeOrder) as AdminOrder[],
      adminOrdersLoaded: true,
    });
  },

  loadDashboard: async () => {
    const dashboard = await fetchAdminDashboard();
    set({
      dashboard: {
        ...dashboard,
        recentOrders: dashboard.recentOrders.map(normalizeOrder),
      },
    });
  },

  saveProduct: async (values, id, file) => {
    try {
      if (id) await updateProduct(id, values, file);
      else await createProduct(values, file);
      await get().loadAdminCatalog();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Produk gagal disimpan."),
      };
    }
  },

  toggleProductActive: async (id, isActive) => {
    const product = get().products.find((item) => item.id === id);
    if (!product) return { ok: false, message: "Produk tidak ditemukan." };
    return get().saveProduct(
      {
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId ?? "",
        price: product.price,
        stock: product.stock,
        description: product.description,
        imageUrl: product.imageUrl ?? "",
        isActive,
        featured: product.featured,
      },
      id,
    );
  },

  removeProduct: async (id) => {
    try {
      await deleteProduct(id);
      await get().loadAdminCatalog();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Produk gagal dinonaktifkan."),
      };
    }
  },

  saveCategory: async (values, id) => {
    try {
      if (id) await updateCategory(id, values);
      else await createCategory(values);
      await get().loadAdminCatalog();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Kategori gagal disimpan."),
      };
    }
  },

  removeCategory: async (id) => {
    try {
      await deleteCategory(id);
      await get().loadAdminCatalog();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Kategori gagal dihapus."),
      };
    }
  },

  saveShippingRate: async (values) => {
    try {
      const existing = get().shippingRates.find(
        (rate) =>
          rate.province.toLowerCase() === values.province.trim().toLowerCase(),
      );
      if (existing) await updateShippingRate(existing.id, values);
      else await createShippingRate(values);
      await get().loadShippingRates();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Tarif ongkir gagal disimpan."),
      };
    }
  },

  setDefaultShippingRate: async (id) => {
    try {
      await setDefaultShippingRateApi(id);
      await get().loadShippingRates();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Tarif default gagal diubah."),
      };
    }
  },

  saveAddress: async (values, _userId, id) => {
    const address = id
      ? await updateAddress(id, values)
      : await createAddress(values);
    await get().loadAddresses();
    return address;
  },

  setDefaultAddress: async (_userId, id) => {
    try {
      await setDefaultAddressApi(id);
      await get().loadAddresses();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Alamat utama gagal diubah."),
      };
    }
  },

  removeAddress: async (id) => {
    try {
      await deleteAddress(id);
      await get().loadAddresses();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Alamat gagal dihapus."),
      };
    }
  },

  placeOrder: async (input) => {
    try {
      if (useCartStore.getState().mode !== "server") {
        await useCartStore.getState().mergeGuest();
      }
      const order = normalizeOrder(
        await checkout({
          addressId: input.address.addressId ?? undefined,
          shipping: {
            recipientName: input.address.recipientName,
            phone: input.address.phone,
            addressLine: input.address.addressLine,
            city: input.address.city,
            province: input.address.province,
            postalCode: input.address.postalCode,
          },
          paymentMethod: input.paymentMethod,
          notes: input.notes,
        }),
      );
      set((state) => ({ orders: [order, ...state.orders] }));
      return { ok: true, order };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Pesanan gagal dibuat."),
      };
    }
  },

  cancelOrder: async (orderNumber, role, _userId, note) => {
    try {
      const source = role === "admin" ? get().adminOrders : get().orders;
      let order = source.find((item) => item.orderNumber === orderNumber);
      if (!order) {
        order =
          role === "admin"
            ? normalizeOrder(await fetchAdminOrderByNumber(orderNumber))
            : normalizeOrder(await fetchMyOrderByNumber(orderNumber));
      }
      const updated = normalizeOrder(
        role === "admin"
          ? await updateOrderStatusApi(order.id, "cancelled", note)
          : await cancelMyOrder(order.id, note),
      );
      set((state) => ({
        orders: replaceOrder(state.orders, updated),
        adminOrders: state.adminOrders.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      }));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(
          error,
          "Pesanan tidak dapat dibatalkan pada status saat ini.",
        ),
      };
    }
  },

  updateOrderStatus: async (orderNumber, to, role, _changedBy, note) => {
    void _changedBy;
    if (role !== "admin") {
      return { ok: false, message: "Hanya admin yang dapat mengubah status." };
    }
    try {
      let order = get().adminOrders.find(
        (item) => item.orderNumber === orderNumber,
      );
      if (!order) {
        order = normalizeOrder(
          await fetchAdminOrderByNumber(orderNumber),
        ) as AdminOrder;
      }
      if (to === "pending") {
        return { ok: false, message: "Status tidak valid." };
      }
      const updated = normalizeOrder(
        await updateOrderStatusApi(order.id, to, note),
      );
      set((state) => ({
        adminOrders: state.adminOrders.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
        orders: replaceOrder(state.orders, updated),
      }));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(error, "Transisi status tidak diizinkan."),
      };
    }
  },

  verifyPayment: async (orderNumber, decision, _changedBy) => {
    void _changedBy;
    try {
      let order = get().adminOrders.find(
        (item) => item.orderNumber === orderNumber,
      );
      if (!order) {
        order = normalizeOrder(
          await fetchAdminOrderByNumber(orderNumber),
        ) as AdminOrder;
      }
      const updated = normalizeOrder(
        await verifyOrderPayment(order.id, decision),
      );
      set((state) => ({
        adminOrders: state.adminOrders.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
        orders: replaceOrder(state.orders, updated),
      }));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(
          error,
          "Pembayaran tidak dapat diverifikasi pada status ini.",
        ),
      };
    }
  },

  submitPaymentProof: async (orderNumber, file) => {
    try {
      let order = get().orders.find(
        (item) => item.orderNumber === orderNumber,
      );
      if (!order) {
        order = normalizeOrder(await fetchMyOrderByNumber(orderNumber));
      }
      const updated = normalizeOrder(
        await uploadPaymentProof(order.id, file),
      );
      set((state) => ({ orders: replaceOrder(state.orders, updated) }));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: errorMessage(
          error,
          "Bukti pembayaran tidak dapat diunggah saat ini.",
        ),
      };
    }
  },
}));
