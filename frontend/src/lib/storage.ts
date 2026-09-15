// ──────────────────────────────────────────────────────────
// FATrack — Data Persistence Layer
// Supports Supabase (primary) with localStorage fallback
// ──────────────────────────────────────────────────────────

import { supabase, isSupabaseConfigured } from './supabase';

export type UserProfile = {
  id: string;
  name: string;
  monthly_salary: number;
  payday_date: number;
  fixed_expenses: number;
};

export type BudgetSettings = {
  needs_percentage: number;
  wants_percentage: number;
  savings_percentage: number;
};

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  category: 'Needs' | 'Wants' | 'Savings';
  transaction_date: string;
  created_at: string;
};

const LS_KEYS = {
  profile: 'fatrack-profile',
  budget: 'fatrack-budget',
  transactions: 'fatrack-transactions',
};

// ─── Profile ─────────────────────────────────────────────

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }
  const raw = localStorage.getItem(LS_KEYS.profile);
  return raw ? JSON.parse(raw) : null;
}

export async function upsertProfile(profile: UserProfile): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('profiles').upsert(profile);
    return;
  }
  localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile));
}

// ─── Budget Settings ─────────────────────────────────────

export async function getBudgetSettings(userId: string): Promise<BudgetSettings> {
  const defaults: BudgetSettings = {
    needs_percentage: 50,
    wants_percentage: 30,
    savings_percentage: 20,
  };

  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('budget_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data
      ? { needs_percentage: data.needs_percentage, wants_percentage: data.wants_percentage, savings_percentage: data.savings_percentage }
      : defaults;
  }

  const raw = localStorage.getItem(LS_KEYS.budget);
  return raw ? JSON.parse(raw) : defaults;
}

export async function saveBudgetSettings(userId: string, settings: BudgetSettings): Promise<void> {
  if (isSupabaseConfigured) {
    const { data: existing } = await supabase
      .from('budget_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('budget_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', userId);
    } else {
      await supabase.from('budget_settings').insert({ user_id: userId, ...settings });
    }
    return;
  }
  localStorage.setItem(LS_KEYS.budget, JSON.stringify(settings));
}

// ─── Transactions ────────────────────────────────────────

export async function getTransactions(userId: string): Promise<Transaction[]> {
  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });
    return data || [];
  }
  const raw = localStorage.getItem(LS_KEYS.transactions);
  return raw ? JSON.parse(raw) : [];
}

export async function addTransaction(userId: string, tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const newTx: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('transactions')
      .insert({ ...newTx, user_id: userId })
      .select()
      .single();
    return data || newTx;
  }

  const all = await getTransactions(userId);
  const updated = [newTx, ...all];
  localStorage.setItem(LS_KEYS.transactions, JSON.stringify(updated));
  return newTx;
}

export async function deleteTransaction(userId: string, txId: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('transactions').delete().eq('id', txId).eq('user_id', userId);
    return;
  }
  const all = await getTransactions(userId);
  const updated = all.filter((t) => t.id !== txId);
  localStorage.setItem(LS_KEYS.transactions, JSON.stringify(updated));
}

/**
 * Get transactions filtered by month (YYYY-MM format).
 */
export async function getTransactionsByMonth(userId: string, yearMonth: string): Promise<Transaction[]> {
  const all = await getTransactions(userId);
  return all.filter((t) => t.transaction_date.startsWith(yearMonth));
}

/**
 * Aggregate spending by category for a given set of transactions.
 */
export function aggregateByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce(
    (acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    },
    {} as Record<string, number>
  );
}
