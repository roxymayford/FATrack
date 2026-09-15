// ──────────────────────────────────────────────────────────
// FATrack — Static Recommendation Data
// ──────────────────────────────────────────────────────────

export type KostTier = {
  id: string;
  tierName: string;
  minSalary: number;
  maxSalary: number;
  estimatedPrice: { min: number; max: number };
  facilities: string[];
  description: string;
};

export type MealPlan = {
  id: string;
  budgetTier: 'low' | 'medium' | 'high';
  title: string;
  estimatedCostPerDay: number;
  estimatedCostPerMonth: number;
  items: { name: string; price: number; unit: string }[];
  description: string;
};

export type GroceryBasket = {
  id: string;
  budgetTier: 'low' | 'medium' | 'high';
  title: string;
  totalCost: number;
  period: string;
  items: { name: string; price: number; quantity: string }[];
};

// ─── Kost Tiers ──────────────────────────────────────────

export const kostTiers: KostTier[] = [
  {
    id: 'kost-basic',
    tierName: 'Kost Ekonomis',
    minSalary: 0,
    maxSalary: 3_000_000,
    estimatedPrice: { min: 600_000, max: 800_000 },
    facilities: ['Kamar Mandi Luar', 'Non-AC', 'Kasur Single', 'Lemari Kecil', 'Parkir Motor'],
    description: 'Kost sederhana dengan kamar mandi bersama, cocok untuk mahasiswa dan pekerja dengan budget terbatas. Biasanya berlokasi di gang atau area kampus.',
  },
  {
    id: 'kost-standard',
    tierName: 'Kost Standard AC',
    minSalary: 3_000_000,
    maxSalary: 6_000_000,
    estimatedPrice: { min: 1_000_000, max: 1_500_000 },
    facilities: ['Kamar Mandi Dalam', 'AC', 'WiFi', 'Kasur Queen', 'Lemari', 'Meja Kerja'],
    description: 'Kost dengan fasilitas lengkap termasuk AC dan kamar mandi dalam. Nyaman untuk first-jobber yang butuh kenyamanan kerja dari kost.',
  },
  {
    id: 'kost-premium',
    tierName: 'Kost Eksklusif / Studio',
    minSalary: 6_000_000,
    maxSalary: Infinity,
    estimatedPrice: { min: 1_800_000, max: 2_500_000 },
    facilities: ['Kamar Mandi Dalam', 'AC', 'WiFi Fiber', 'Smart TV', 'Dapur Kecil', 'Laundry', 'Cleaning Service', 'CCTV 24 Jam'],
    description: 'Kost premium atau apartemen studio dengan fasilitas hotel-like. Cocok untuk profesional muda yang mengutamakan privasi dan produktivitas.',
  },
];

// ─── Meal Plans (Per Hari) ───────────────────────────────

export const mealPlans: MealPlan[] = [
  {
    id: 'meal-hemat',
    budgetTier: 'low',
    title: 'Masak Sendiri — Hemat Maksimal',
    estimatedCostPerDay: 25_000,
    estimatedCostPerMonth: 750_000,
    items: [
      { name: 'Beras 1 kg', price: 14_000, unit: '/ kg' },
      { name: 'Telur 1 butir', price: 2_500, unit: '/ butir' },
      { name: 'Tempe 1 papan', price: 3_000, unit: '/ papan' },
      { name: 'Sayur Kangkung', price: 3_000, unit: '/ ikat' },
      { name: 'Minyak Goreng', price: 2_500, unit: '/ 100ml' },
    ],
    description: 'Menu masak sendiri dengan bahan pokok dari minimarket/pasar. Hemat tapi tetap bergizi.',
  },
  {
    id: 'meal-warteg',
    budgetTier: 'medium',
    title: 'Makan Luar — Warteg & Warung',
    estimatedCostPerDay: 45_000,
    estimatedCostPerMonth: 1_350_000,
    items: [
      { name: 'Nasi + 2 Lauk Warteg', price: 15_000, unit: '/ porsi' },
      { name: 'Nasi Goreng Warung', price: 15_000, unit: '/ porsi' },
      { name: 'Es Teh Manis', price: 5_000, unit: '/ gelas' },
      { name: 'Gorengan Snack', price: 5_000, unit: '/ 4 pcs' },
      { name: 'Kopi Sachet', price: 5_000, unit: '/ gelas' },
    ],
    description: 'Makan di warteg dan warung makan sekitar kost/kantor. Praktis untuk yang tidak sempat masak.',
  },
  {
    id: 'meal-mixed',
    budgetTier: 'high',
    title: 'Campuran — Masak + Makan Luar',
    estimatedCostPerDay: 65_000,
    estimatedCostPerMonth: 1_950_000,
    items: [
      { name: 'Sarapan (Roti + Kopi)', price: 10_000, unit: '/ pagi' },
      { name: 'Makan Siang (Resto/Kantin)', price: 25_000, unit: '/ porsi' },
      { name: 'Makan Malam (Masak/Beli)', price: 20_000, unit: '/ porsi' },
      { name: 'Snack & Minuman', price: 10_000, unit: '/ hari' },
    ],
    description: 'Kombinasi masak sendiri dan makan di luar. Balance antara hemat dan kenyamanan.',
  },
];

// ─── Grocery Baskets (Belanja Bulanan) ────────────────────

export const groceryBaskets: GroceryBasket[] = [
  {
    id: 'grocery-basic',
    budgetTier: 'low',
    title: 'Paket Pokok Bulanan — Minimarket',
    totalCost: 285_000,
    period: 'Per Bulan',
    items: [
      { name: 'Beras 5 kg', price: 70_000, quantity: '1x' },
      { name: 'Telur 1 kg (±16 butir)', price: 30_000, quantity: '1x' },
      { name: 'Minyak Goreng 1 Liter', price: 18_000, quantity: '2x' },
      { name: 'Gula Pasir 1 kg', price: 16_000, quantity: '1x' },
      { name: 'Kecap Manis 135ml', price: 8_500, quantity: '2x' },
      { name: 'Mie Instan (isi 5)', price: 14_500, quantity: '4x' },
      { name: 'Kornet Kaleng', price: 16_000, quantity: '2x' },
      { name: 'Kopi Sachet (isi 10)', price: 18_000, quantity: '1x' },
      { name: 'Sabun Mandi & Shampoo', price: 25_000, quantity: '1x' },
      { name: 'Tisu & Pembersih', price: 12_000, quantity: '1x' },
    ],
  },
  {
    id: 'grocery-standard',
    budgetTier: 'medium',
    title: 'Paket Lengkap — Alfamart/Indomaret',
    totalCost: 485_000,
    period: 'Per Bulan',
    items: [
      { name: 'Beras Premium 5 kg', price: 85_000, quantity: '1x' },
      { name: 'Telur 1.5 kg', price: 45_000, quantity: '1x' },
      { name: 'Daging Ayam 1 kg', price: 38_000, quantity: '2x' },
      { name: 'Minyak Goreng 2 Liter', price: 32_000, quantity: '1x' },
      { name: 'Susu UHT 1 Liter', price: 18_000, quantity: '4x' },
      { name: 'Sayur & Buah Segar', price: 50_000, quantity: '4x' },
      { name: 'Bumbu Dapur Lengkap', price: 35_000, quantity: '1x' },
      { name: 'Snack & Roti', price: 30_000, quantity: '2x' },
      { name: 'Toiletries Set', price: 45_000, quantity: '1x' },
      { name: 'Air Mineral Galon', price: 20_000, quantity: '2x' },
    ],
  },
  {
    id: 'grocery-premium',
    budgetTier: 'high',
    title: 'Paket Premium — Supermarket',
    totalCost: 750_000,
    period: 'Per Bulan',
    items: [
      { name: 'Beras Organik 5 kg', price: 110_000, quantity: '1x' },
      { name: 'Telur Omega 3 (30 butir)', price: 65_000, quantity: '1x' },
      { name: 'Daging Ayam & Ikan', price: 85_000, quantity: '4x' },
      { name: 'Olive Oil 500ml', price: 55_000, quantity: '1x' },
      { name: 'Susu Almond/Oat 1L', price: 35_000, quantity: '4x' },
      { name: 'Sayur & Buah Segar', price: 75_000, quantity: '4x' },
      { name: 'Greek Yogurt', price: 25_000, quantity: '4x' },
      { name: 'Whole Wheat Bread', price: 28_000, quantity: '2x' },
      { name: 'Toiletries Premium', price: 65_000, quantity: '1x' },
      { name: 'Vitamin & Suplemen', price: 45_000, quantity: '1x' },
    ],
  },
];

/**
 * Get the kost tier matching a given salary.
 */
export function getKostTierForSalary(salary: number): KostTier {
  return kostTiers.find((t) => salary >= t.minSalary && salary < t.maxSalary) || kostTiers[0];
}

/**
 * Get all applicable kost tiers (current + lower).
 */
export function getApplicableKostTiers(salary: number): KostTier[] {
  return kostTiers.filter((t) => salary >= t.minSalary);
}

/**
 * Get meal plans for a budget tier.
 */
export function getMealPlansForTier(tier: 'low' | 'medium' | 'high'): MealPlan[] {
  const order = { low: 0, medium: 1, high: 2 };
  return mealPlans.filter((m) => order[m.budgetTier] <= order[tier]);
}

/**
 * Get grocery basket for a budget tier.
 */
export function getGroceryForTier(tier: 'low' | 'medium' | 'high'): GroceryBasket {
  return groceryBaskets.find((g) => g.budgetTier === tier) || groceryBaskets[0];
}
