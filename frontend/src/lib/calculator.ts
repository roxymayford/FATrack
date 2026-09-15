// ──────────────────────────────────────────────────────────
// FATrack — Financial Calculation Engine
// ──────────────────────────────────────────────────────────

export type AllocationPercentages = {
  needs: number;   // 0–100
  wants: number;   // 0–100
  savings: number; // 0–100
};

export type AllocationResult = {
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  disposableIncome: number;
  dailyLimit: number;
  daysInCycle: number;
};

export type FinancialHealthInput = {
  totalSpent: number;
  needsSpent: number;
  wantsSpent: number;
  savingsActual: number;
  targetNeeds: number;
  targetWants: number;
  targetSavings: number;
};

/**
 * Returns the number of days between two payday dates.
 * Uses current month's payday → next month's payday.
 */
export function getDaysInCurrentCycle(paydayDate: number): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Current cycle start
  const cycleStart = new Date(year, month, paydayDate);
  if (now < cycleStart) {
    // We're before this month's payday — cycle is previous month → this month
    const prevStart = new Date(year, month - 1, paydayDate);
    return Math.round((cycleStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  // We're after this month's payday — cycle is this month → next month
  const nextStart = new Date(year, month + 1, paydayDate);
  return Math.round((nextStart.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns the day index within the current pay cycle (1-based).
 */
export function getDayInCycle(paydayDate: number): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let cycleStart = new Date(year, month, paydayDate);
  if (now < cycleStart) {
    cycleStart = new Date(year, month - 1, paydayDate);
  }

  const diff = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

/**
 * Core allocation calculation.
 *
 * Formula for Daily Limit (Batas Jajan Harian):
 *   (Gaji Netto − Fixed Expenses − Target Tabungan) / Jumlah Hari
 */
export function calculateAllocation(
  monthlySalary: number,
  fixedExpenses: number,
  percentages: AllocationPercentages
): AllocationResult {
  const afterFixed = monthlySalary - fixedExpenses;
  const needsAmount = (afterFixed * percentages.needs) / 100;
  const wantsAmount = (afterFixed * percentages.wants) / 100;
  const savingsAmount = (afterFixed * percentages.savings) / 100;

  const daysInCycle = getDaysInCurrentCycle(25); // default payday 25
  const disposableIncome = afterFixed - savingsAmount;
  const dailyLimit = disposableIncome / daysInCycle;

  return {
    needsAmount,
    wantsAmount,
    savingsAmount,
    disposableIncome,
    dailyLimit: Math.max(0, dailyLimit),
    daysInCycle,
  };
}

/**
 * Overload that accepts a custom payday date.
 */
export function calculateAllocationWithPayday(
  monthlySalary: number,
  fixedExpenses: number,
  percentages: AllocationPercentages,
  paydayDate: number
): AllocationResult {
  const afterFixed = monthlySalary - fixedExpenses;
  const needsAmount = (afterFixed * percentages.needs) / 100;
  const wantsAmount = (afterFixed * percentages.wants) / 100;
  const savingsAmount = (afterFixed * percentages.savings) / 100;

  const daysInCycle = getDaysInCurrentCycle(paydayDate);
  const disposableIncome = afterFixed - savingsAmount;
  const dailyLimit = disposableIncome / daysInCycle;

  return {
    needsAmount,
    wantsAmount,
    savingsAmount,
    disposableIncome,
    dailyLimit: Math.max(0, dailyLimit),
    daysInCycle,
  };
}

/**
 * Financial Health Score (0–100).
 *
 * Scoring factors:
 *   - Savings discipline (40 pts): Are you hitting your savings target?
 *   - Wants control (35 pts): Is Wants spending within allocation?
 *   - Needs efficiency (25 pts): Is Needs spending within allocation?
 */
export function calculateFinancialHealthScore(input: FinancialHealthInput): number {
  let score = 0;

  // Savings discipline (40 pts)
  if (input.targetSavings > 0) {
    const savingsRatio = Math.min(input.savingsActual / input.targetSavings, 1);
    score += savingsRatio * 40;
  } else {
    score += 40; // No savings target = perfect score for this dimension
  }

  // Wants control (35 pts)
  if (input.targetWants > 0) {
    const wantsRatio = input.wantsSpent / input.targetWants;
    if (wantsRatio <= 1) {
      score += 35;
    } else {
      // Deduct proportionally, min 0
      score += Math.max(0, 35 - (wantsRatio - 1) * 35);
    }
  } else {
    score += input.wantsSpent === 0 ? 35 : 0;
  }

  // Needs efficiency (25 pts)
  if (input.targetNeeds > 0) {
    const needsRatio = input.needsSpent / input.targetNeeds;
    if (needsRatio <= 1) {
      score += 25;
    } else {
      score += Math.max(0, 25 - (needsRatio - 1) * 25);
    }
  } else {
    score += input.needsSpent === 0 ? 25 : 0;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Format a number as Indonesian Rupiah string.
 */
export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

/**
 * Parse a Rupiah-formatted string back to a number.
 */
export function parseRupiah(str: string): number {
  const cleaned = str.replace(/[^0-9]/g, '');
  return Number(cleaned) || 0;
}

/**
 * Determine the kost budget tier based on monthly salary.
 */
export function getKostTier(monthlySalary: number): 'low' | 'medium' | 'high' {
  if (monthlySalary < 3_000_000) return 'low';
  if (monthlySalary <= 6_000_000) return 'medium';
  return 'high';
}

/**
 * Calculate recommended kost budget (20–25% of salary).
 */
export function getKostBudget(monthlySalary: number): { min: number; max: number } {
  return {
    min: monthlySalary * 0.2,
    max: monthlySalary * 0.25,
  };
}

/**
 * Calculate daily food budget from the Needs allocation.
 */
export function getDailyFoodBudget(needsAmount: number, daysInMonth: number): number {
  // Roughly 40% of Needs goes to food
  return (needsAmount * 0.4) / daysInMonth;
}
