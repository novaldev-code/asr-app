import { addHours, format } from "date-fns";
import { PROVINCES } from "@/lib/constants";
import type {
  Address,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistory,
  PaymentMethod,
  PaymentStatus,
  Product,
  ShippingRate,
} from "@/lib/types";

const IMAGES = [
  "photo-1447933601403-0c6688de566e",
  "photo-1559056199-641a0ac8b55e",
  "photo-1514432324607-a09d9b4aefdd",
  "photo-1495474472287-4d71bcdd2085",
  "photo-1509042239860-f550ce710b93",
  "photo-1461023058943-07fcbe16d735",
  "photo-1510707577719-ae7c14805e3a",
  "photo-1570968915860-54d5c301fa9f",
  "photo-1544787219-7f47ccb76574",
  "photo-1521302080334-4bebac2763a6",
  "photo-1517256064527-09c73fc73e38",
  "photo-1545665225-b23b99e4d45e",
  "photo-1498804103079-a6351b050096",
  "photo-1524350876685-274059332603",
  "photo-1504630083234-14187a9df0f5",
  "photo-1442512595331-e89e73853f31",
  "photo-1485808191679-5f86510681a2",
  "photo-1495774856032-8b90bbb32b32",
  "photo-1512568400610-62da28bc8a13",
  "photo-1497935586351-b67a49e012bf",
  "photo-1470337458703-46ad1756a187",
  "photo-1445116572660-236099ec97a0",
  "photo-1506372023823-741c83b836fe",
  "photo-1520031441872-265e4ff70366",
];

function image(index: number): string {
  return `https://images.unsplash.com/${IMAGES[index % IMAGES.length]}?auto=format&fit=crop&w=900&q=80`;
}

const TIMESTAMP = "2026-10-01T08:00:00.000Z";

export function makeCategories(): Category[] {
  return [
    {
      id: "c1",
      name: "Biji Kopi",
      slug: "biji-kopi",
      description: "Biji sangrai segar dari berbagai daerah di Indonesia.",
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
    {
      id: "c2",
      name: "Kopi Bubuk",
      slug: "kopi-bubuk",
      description: "Praktis diseduh kapan saja, cocok untuk di rumah dan kantor.",
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
    {
      id: "c3",
      name: "Drip Bag",
      slug: "drip-bag",
      description: "Kopi sachet sekali seduh untuk perjalanan dan waktu sibuk.",
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
    {
      id: "c4",
      name: "Alat Seduh",
      slug: "alat-seduh",
      description: "Peralatan manual brew untuk ritual kopi yang lebih nikmat.",
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
    {
      id: "c5",
      name: "Merchandise",
      slug: "merchandise",
      description: "Tumbler, mug, dan tas untuk menemani hari Anda.",
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
    {
      id: "c6",
      name: "Paket Hadiah",
      slug: "paket-hadiah",
      description: "Paket kopi pilihan yang siap dihadiahkan.",
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
  ];
}

interface ProductSeed {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  stock: number;
  featured?: boolean;
  isActive?: boolean;
  description: string;
  imageIndex: number;
  slug: string;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: "p1",
    categoryId: "c1",
    name: "Arabika Gayo Premium",
    slug: "arabika-gayo-premium",
    price: 95000,
    stock: 24,
    featured: true,
    description:
      "Biji arabika dari dataran tinggi Gayo dengan profil rasa cokelat, jeruk manis, dan keasaman yang lembut. Cocok untuk pour over maupun espresso.",
    imageIndex: 0,
  },
  {
    id: "p2",
    categoryId: "c1",
    name: "Arabika Toraja Sapan",
    slug: "arabika-toraja-sapan",
    price: 105000,
    stock: 18,
    description:
      "Sangrai medium dengan aroma rempah manis, body tebal, dan aftertaste karamel yang panjang.",
    imageIndex: 1,
  },
  {
    id: "p3",
    categoryId: "c1",
    name: "Robusta Lampung",
    slug: "robusta-lampung",
    price: 75000,
    stock: 30,
    description:
      "Robusta dengan body kuat dan sentuhan kacang panggang. Pilihan tepat untuk pecinta kopi pekat.",
    imageIndex: 2,
  },
  {
    id: "p4",
    categoryId: "c1",
    name: "House Blend Mocha",
    slug: "house-blend-mocha",
    price: 88000,
    stock: 40,
    featured: true,
    description:
      "Perpaduan arabika dan robusta yang seimbang, manis, dan mudah dinikmati setiap hari.",
    imageIndex: 3,
  },
  {
    id: "p5",
    categoryId: "c1",
    name: "Arabika Kintamani",
    slug: "arabika-kintamani",
    price: 110000,
    stock: 12,
    description:
      "Biji kopi Bali dengan karakter buah tropis, floral, dan keasaman cerah yang menyegarkan.",
    imageIndex: 4,
  },
  {
    id: "p6",
    categoryId: "c2",
    name: "Kopi Bubuk Gayo 250g",
    slug: "kopi-bubuk-gayo-250g",
    price: 68000,
    stock: 35,
    featured: true,
    description:
      "Gayo premium yang digiling halus, siap diseduh dengan V60, tubruk, atau moka pot.",
    imageIndex: 5,
  },
  {
    id: "p7",
    categoryId: "c2",
    name: "Kopi Bubuk House Blend 250g",
    slug: "kopi-bubuk-house-blend-250g",
    price: 62000,
    stock: 50,
    description:
      "Rasa seimbang dan ramah di lidah, cocok untuk kopi susu maupun kopi hitam.",
    imageIndex: 6,
  },
  {
    id: "p8",
    categoryId: "c2",
    name: "Kopi Bubuk Robusta 250g",
    slug: "kopi-bubuk-robusta-250g",
    price: 55000,
    stock: 0,
    description:
      "Robusta murni dengan aroma kuat. Sedang tidak tersedia, silakan cek varian lain.",
    imageIndex: 7,
  },
  {
    id: "p9",
    categoryId: "c2",
    name: "Espresso Blend 250g",
    slug: "espresso-blend-250g",
    price: 78000,
    stock: 22,
    description:
      "Blend khusus espresso dengan crema tebal, rasa cokelat, dan manis alami.",
    imageIndex: 8,
  },
  {
    id: "p10",
    categoryId: "c3",
    name: "Drip Bag Gayo (10 pcs)",
    slug: "drip-bag-gayo-10-pcs",
    price: 85000,
    stock: 28,
    featured: true,
    description:
      "Sepuluh kantong drip praktis berisi Gayo premium. Cukup tuang air panas, nikmati di mana saja.",
    imageIndex: 9,
  },
  {
    id: "p11",
    categoryId: "c3",
    name: "Drip Bag House Blend (10 pcs)",
    slug: "drip-bag-house-blend-10-pcs",
    price: 75000,
    stock: 33,
    description:
      "Drip bag harian dengan rasa seimbang, praktis untuk dibawa ke kantor atau bepergian.",
    imageIndex: 10,
  },
  {
    id: "p12",
    categoryId: "c3",
    name: "Drip Bag Variety Pack (12 pcs)",
    slug: "drip-bag-variety-pack-12-pcs",
    price: 99000,
    stock: 15,
    description:
      "Dua belas drip bag dari empat single origin berbeda untuk mencoba beragam rasa.",
    imageIndex: 11,
  },
  {
    id: "p13",
    categoryId: "c4",
    name: "Moka Pot Stainless 3 Cup",
    slug: "moka-pot-stainless-3-cup",
    price: 185000,
    stock: 10,
    description:
      "Moka pot stainless steel tahan lama untuk kopi pekat ala Italia di dapur Anda.",
    imageIndex: 12,
  },
  {
    id: "p14",
    categoryId: "c4",
    name: "French Press 600ml",
    slug: "french-press-600ml",
    price: 165000,
    stock: 8,
    description:
      "French press kaca borosilikat 600 ml dengan filter stainless, mudah dibersihkan.",
    imageIndex: 13,
  },
  {
    id: "p15",
    categoryId: "c4",
    name: "V60 Dripper Keramik",
    slug: "v60-dripper-keramik",
    price: 145000,
    stock: 14,
    description:
      "Dripper keramik dengan alur spiral untuk ekstraksi pour over yang konsisten.",
    imageIndex: 14,
  },
  {
    id: "p16",
    categoryId: "c4",
    name: "Hand Grinder Manual",
    slug: "hand-grinder-manual",
    price: 275000,
    stock: 6,
    featured: true,
    description:
      "Grinder manual dengan burr baja dan pengaturan halus, ideal untuk perjalanan.",
    imageIndex: 15,
  },
  {
    id: "p17",
    categoryId: "c4",
    name: "Timbangan Kopi Digital",
    slug: "timbangan-kopi-digital",
    price: 120000,
    stock: 20,
    description:
      "Timbangan digital presisi 0,1 g dengan timer, membantu konsistensi resep kopi.",
    imageIndex: 16,
  },
  {
    id: "p18",
    categoryId: "c4",
    name: "Kettle Leher Angsa 600ml",
    slug: "kettle-leher-angsa-600ml",
    price: 235000,
    stock: 5,
    description:
      "Kettle leher angsa dengan aliran air stabil untuk pour over yang lebih terkontrol.",
    imageIndex: 17,
  },
  {
    id: "p19",
    categoryId: "c5",
    name: "Tumbler Keramik Mocha",
    slug: "tumbler-keramik-mocha",
    price: 125000,
    stock: 25,
    description:
      "Tumbler keramik berlapis warna mocha, menjaga suhu minuman lebih lama.",
    imageIndex: 18,
  },
  {
    id: "p20",
    categoryId: "c5",
    name: "Tote Bag Canvas",
    slug: "tote-bag-canvas",
    price: 89000,
    stock: 40,
    description:
      "Tote bag kanvas tebal dengan sablon logo Mocha & Co., kuat untuk aktivitas harian.",
    imageIndex: 19,
  },
  {
    id: "p21",
    categoryId: "c5",
    name: "Mug Cappuccino 350ml",
    slug: "mug-cappuccino-350ml",
    price: 95000,
    stock: 30,
    description:
      "Mug keramik 350 ml dengan bentuk cappuccino klasik, nyaman digenggam.",
    imageIndex: 20,
  },
  {
    id: "p22",
    categoryId: "c6",
    name: "Paket Ngopi Pagi",
    slug: "paket-ngopi-pagi",
    price: 150000,
    stock: 16,
    featured: true,
    description:
      "Paket berisi kopi bubuk 250 g, drip bag 5 pcs, dan mug eksklusif. Siap menemani pagi.",
    imageIndex: 21,
  },
  {
    id: "p23",
    categoryId: "c6",
    name: "Paket Hadiah Premium",
    slug: "paket-hadiah-premium",
    price: 275000,
    stock: 9,
    description:
      "Kotak hadiah berisi dua single origin 200 g, dripper keramik, dan kartu ucapan.",
    imageIndex: 22,
  },
  {
    id: "p24",
    categoryId: "c6",
    name: "Paket Kantor 500g",
    slug: "paket-kantor-500g",
    price: 195000,
    stock: 12,
    isActive: false,
    description:
      "Paket hemat untuk kebutuhan kopi kantor. Untuk sementara tidak ditampilkan di katalog.",
    imageIndex: 23,
  },
];

export function makeProducts(): Product[] {
  return PRODUCT_SEEDS.map((seed) => ({
    id: seed.id,
    categoryId: seed.categoryId,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    price: seed.price,
    stock: seed.stock,
    imageUrl: image(seed.imageIndex),
    isActive: seed.isActive ?? true,
    featured: seed.featured ?? false,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  }));
}

export function makeShippingRates(): ShippingRate[] {
  const special: Record<string, number> = {
    "DKI Jakarta": 15000,
    Banten: 18000,
    "Jawa Barat": 18000,
    "Jawa Tengah": 22000,
    "DI Yogyakarta": 22000,
    "Jawa Timur": 22000,
    Bali: 30000,
    "Sumatera Utara": 32000,
    "Sumatera Barat": 32000,
    "Sumatera Selatan": 32000,
    Lampung: 30000,
    "Kalimantan Timur": 38000,
    "Kalimantan Selatan": 38000,
    "Sulawesi Selatan": 42000,
    "Sulawesi Utara": 45000,
    Maluku: 55000,
    Papua: 65000,
  };

  const rates: ShippingRate[] = PROVINCES.map((province) => ({
    id: `ship-${province.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    province,
    cost: special[province] ?? 25000,
    isDefault: false,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  }));
  rates.push({
    id: "ship-default",
    province: "Default",
    cost: 25000,
    isDefault: true,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  });
  return rates;
}

export function makeAddresses(): Address[] {
  return [
    {
      id: "addr-1",
      userId: "user-customer",
      recipientName: "Nadia Pelanggan",
      phone: "081234567890",
      addressLine: "Jl. Melati No. 12, Kebayoran Baru",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12130",
      isDefault: true,
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
  ];
}

interface OrderSeed {
  id: string;
  seq: number;
  created: string;
  status: OrderStatus;
  method: PaymentMethod;
  paymentStatus: PaymentStatus;
  lines: { productId: string; quantity: number }[];
  notes?: string;
  paidAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  expiresAt?: string;
}

const ORDER_SEEDS: OrderSeed[] = [
  {
    id: "o1",
    seq: 1,
    created: "2026-11-12T09:12:00.000Z",
    status: "pending",
    method: "bank_transfer",
    paymentStatus: "waiting_verification",
    lines: [
      { productId: "p1", quantity: 1 },
      { productId: "p10", quantity: 2 },
    ],
    notes: "Tolong dibungkus rapi untuk hadiah.",
    expiresAt: "2026-11-13T09:12:00.000Z",
  },
  {
    id: "o2",
    seq: 2,
    created: "2026-11-12T03:40:00.000Z",
    status: "pending",
    method: "cod",
    paymentStatus: "unpaid",
    lines: [{ productId: "p6", quantity: 2 }],
  },
  {
    id: "o3",
    seq: 3,
    created: "2026-11-10T07:25:00.000Z",
    status: "processing",
    method: "bank_transfer",
    paymentStatus: "paid",
    paidAt: "2026-11-10T10:02:00.000Z",
    lines: [
      { productId: "p16", quantity: 1 },
      { productId: "p4", quantity: 1 },
    ],
    notes: "Grinder tolong dicek dulu sebelum dikirim.",
  },
  {
    id: "o4",
    seq: 4,
    created: "2026-11-08T11:30:00.000Z",
    status: "shipped",
    method: "bank_transfer",
    paymentStatus: "paid",
    paidAt: "2026-11-08T12:10:00.000Z",
    lines: [
      { productId: "p13", quantity: 1 },
      { productId: "p2", quantity: 1 },
    ],
  },
  {
    id: "o5",
    seq: 5,
    created: "2026-11-05T02:15:00.000Z",
    status: "completed",
    method: "cod",
    paymentStatus: "paid",
    paidAt: "2026-11-07T09:00:00.000Z",
    lines: [
      { productId: "p19", quantity: 1 },
      { productId: "p7", quantity: 2 },
    ],
  },
  {
    id: "o6",
    seq: 6,
    created: "2026-11-03T06:45:00.000Z",
    status: "cancelled",
    method: "bank_transfer",
    paymentStatus: "unpaid",
    cancelledAt: "2026-11-04T06:45:00.000Z",
    cancelledBy: "user-customer",
    expiresAt: "2026-11-04T06:45:00.000Z",
    lines: [{ productId: "p11", quantity: 1 }],
  },
  {
    id: "o7",
    seq: 7,
    created: "2026-11-01T04:20:00.000Z",
    status: "pending",
    method: "bank_transfer",
    paymentStatus: "unpaid",
    expiresAt: "2026-11-02T04:20:00.000Z",
    lines: [{ productId: "p12", quantity: 1 }],
  },
  {
    id: "o8",
    seq: 8,
    created: "2026-10-28T08:00:00.000Z",
    status: "completed",
    method: "bank_transfer",
    paymentStatus: "paid",
    paidAt: "2026-10-28T09:15:00.000Z",
    lines: [{ productId: "p22", quantity: 1 }],
  },
  {
    id: "o9",
    seq: 9,
    created: "2026-11-11T05:10:00.000Z",
    status: "processing",
    method: "cod",
    paymentStatus: "unpaid",
    lines: [
      { productId: "p20", quantity: 1 },
      { productId: "p21", quantity: 1 },
    ],
  },
  {
    id: "o10",
    seq: 10,
    created: "2026-10-20T01:30:00.000Z",
    status: "cancelled",
    method: "cod",
    paymentStatus: "unpaid",
    cancelledAt: "2026-10-21T01:30:00.000Z",
    cancelledBy: "user-admin",
    lines: [{ productId: "p5", quantity: 1 }],
  },
];

function buildHistory(orderId: string, seed: OrderSeed): OrderStatusHistory[] {
  const chain: { status: OrderStatus; by: string | null; note: string }[] = [
    {
      status: "pending",
      by: "user-customer",
      note: "Pesanan dibuat pelanggan.",
    },
  ];

  if (seed.status === "processing" || seed.status === "shipped" || seed.status === "completed") {
    chain.push({
      status: "processing",
      by: "user-admin",
      note: seed.method === "cod" ? "Pesanan COD mulai diproses." : "Pembayaran terverifikasi, pesanan diproses.",
    });
  }
  if (seed.status === "shipped" || seed.status === "completed") {
    chain.push({ status: "shipped", by: "user-admin", note: "Pesanan diserahkan ke kurir." });
  }
  if (seed.status === "completed") {
    chain.push({ status: "completed", by: "user-admin", note: "Pesanan selesai." });
  }
  if (seed.status === "cancelled") {
    chain.push({
      status: "cancelled",
      by: seed.cancelledBy ?? "user-admin",
      note: "Pesanan dibatalkan dan stok dikembalikan.",
    });
  }

  return chain.map((entry, index) => ({
    id: `${orderId}-h${index + 1}`,
    orderId,
    fromStatus: index === 0 ? null : chain[index - 1].status,
    toStatus: entry.status,
    changedBy: entry.by,
    note: entry.note,
    createdAt:
      index === 0
        ? seed.created
        : seed.paidAt && entry.status === "processing"
          ? seed.paidAt
          : seed.cancelledAt && entry.status === "cancelled"
            ? seed.cancelledAt
            : addHours(new Date(seed.created), index * 6).toISOString(),
  }));
}

export function makeOrders(): Order[] {
  const products = makeProducts();
  const rates = makeShippingRates();
  const jakartaRate = rates.find((rate) => rate.province === "DKI Jakarta")!;

  return ORDER_SEEDS.map((seed) => {
    const items: OrderItem[] = seed.lines.map((line, index) => {
      const product = products.find((item) => item.id === line.productId)!;
      return {
        id: `${seed.id}-i${index + 1}`,
        orderId: seed.id,
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: line.quantity,
        lineTotal: product.price * line.quantity,
      };
    });

    const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
    const shippingCost = jakartaRate.cost;
    return {
      id: seed.id,
      orderNumber: `ORD-${format(new Date(seed.created), "yyyyMMdd")}-${String(seed.seq).padStart(4, "0")}`,
      userId: "user-customer",
      addressId: "addr-1",
      status: seed.status,
      paymentMethod: seed.method,
      paymentStatus: seed.paymentStatus,
      paymentProofUrl:
        seed.paymentStatus === "waiting_verification" || seed.paymentStatus === "paid"
          ? "bukti-transfer.jpg"
          : null,
      paidAt: seed.paidAt ?? null,
      cancelledAt: seed.cancelledAt ?? null,
      expiresAt: seed.expiresAt ?? null,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      recipientName: "Nadia Pelanggan",
      phone: "081234567890",
      shippingAddress: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12130",
      notes: seed.notes ?? "",
      createdAt: seed.created,
      updatedAt: seed.cancelledAt ?? seed.paidAt ?? seed.created,
      items,
      history: buildHistory(seed.id, seed),
    } satisfies Order;
  });
}

export const SEED_PRODUCTS = makeProducts();
export const SEED_CATEGORIES = makeCategories();
export const SEED_SHIPPING_RATES = makeShippingRates();
export const SEED_ADDRESSES = makeAddresses();
export const SEED_ORDERS = makeOrders();
