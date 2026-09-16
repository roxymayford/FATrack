import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
};

export type UserSubscription = {
  id?: string;
  plan: 'free' | 'premium_monthly' | 'premium_yearly';
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  isPremium: boolean;
  startedAt?: string | null;
  expiresAt?: string | null;
  midtransOrderId?: string | null;
};

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Advisor Bulanan',
    price: 29900,
    durationDays: 30,
    description: 'Akses penuh fitur rekomendasi finansial cerdas & Safe-to-Spend selama 30 hari.',
  },
  {
    id: 'premium_yearly',
    name: 'Advisor Tahunan',
    price: 249000,
    durationDays: 365,
    description: 'Hemat 30%! Akses prioritas semua fitur penasihat keuangan selama 1 tahun penuh.',
  },
];

type SubscriptionContextType = {
  subscription: UserSubscription;
  isPremium: boolean;
  loading: boolean;
  plans: SubscriptionPlan[];
  fetchStatus: () => Promise<void>;
  createSnapTransaction: (planKey: string) => Promise<{
    token?: string;
    redirectUrl?: string;
    orderId?: string;
    isMock?: boolean;
    error?: string;
  }>;
  activateSubscription: (planKey: string) => Promise<{ success: boolean; error?: string }>;
  resetToFree: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const LS_SUB_KEY = 'fatrack-subscription';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: 'free',
    status: 'active',
    isPremium: false,
    expiresAt: null,
  });
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to get auth token
  const getAuthToken = async (): Promise<string> => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        return data.session.access_token;
      }
    }
    return 'kontor_session_dummy_token';
  };

  // Fetch status from Backend or LocalStorage
  const fetchStatus = useCallback(async () => {
    if (!user) {
      setSubscription({
        plan: 'free',
        status: 'active',
        isPremium: false,
        expiresAt: null,
      });
      setLoading(false);
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/subscription/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setSubscription(json.data);
          localStorage.setItem(LS_SUB_KEY, JSON.stringify(json.data));
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      // Backend not reached or offline -> Fallback to localStorage
      console.warn('[SubscriptionContext] Backend unavailable, using local persistence.');
    }

    // Fallback: localStorage
    const saved = localStorage.getItem(LS_SUB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isExpired = parsed.expiresAt ? new Date(parsed.expiresAt) < new Date() : false;
        const isPrem = (parsed.plan === 'premium_monthly' || parsed.plan === 'premium_yearly') &&
          parsed.status === 'active' &&
          !isExpired;
        setSubscription({
          ...parsed,
          status: isExpired ? 'expired' : parsed.status,
          isPremium: isPrem,
        });
      } catch (e) {
        // ignore JSON parse error
      }
    } else {
      setSubscription({
        plan: 'free',
        status: 'active',
        isPremium: false,
        expiresAt: null,
      });
    }

    setLoading(false);
  }, [user]);

  // Initial fetch and fetch when user changes
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Fetch plans from backend if available
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/subscription/plans`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && Array.isArray(json.data)) {
          setPlans(json.data);
        }
      })
      .catch(() => {
        // use default plans
      });
  }, []);

  // Create Snap Transaction
  const createSnapTransaction = async (planKey: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planKey }),
      });

      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'Gagal memulai transaksi');
      }

      return json.data;
    } catch (err: any) {
      console.warn('[SubscriptionContext] Create Snap failed:', err.message);
      // Mock Snap token for fallback demo
      const mockToken = `mock_snap_${Date.now()}`;
      return {
        token: mockToken,
        redirectUrl: '#',
        orderId: `FATRACK-DEMO-${Date.now()}`,
        isMock: true,
      };
    }
  };

  // Activate Subscription (after payment or simulate)
  const activateSubscription = async (planKey: string): Promise<{ success: boolean; error?: string }> => {
    const selectedPlan = plans.find((p) => p.id === planKey) || DEFAULT_PLANS[0];
    const durationDays = selectedPlan.durationDays;
    const expires = new Date();
    expires.setDate(expires.getDate() + durationDays);

    const newSubData: UserSubscription = {
      plan: planKey as any,
      status: 'active',
      isPremium: true,
      startedAt: new Date().toISOString(),
      expiresAt: expires.toISOString(),
    };

    try {
      const token = await getAuthToken();
      await fetch(`${BACKEND_URL}/api/subscription/simulate-activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planKey }),
      });
    } catch (err) {
      console.warn('[SubscriptionContext] Server activation sync fallback to local.');
    }

    // Always update client state & local persistence
    setSubscription(newSubData);
    localStorage.setItem(LS_SUB_KEY, JSON.stringify(newSubData));
    return { success: true };
  };

  const resetToFree = async (): Promise<void> => {
    const freeSub: UserSubscription = {
      plan: 'free',
      status: 'active',
      isPremium: false,
      expiresAt: null,
    };
    setSubscription(freeSub);
    localStorage.setItem(LS_SUB_KEY, JSON.stringify(freeSub));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPremium: subscription.isPremium,
        loading,
        plans,
        fetchStatus,
        createSnapTransaction,
        activateSubscription,
        resetToFree,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
