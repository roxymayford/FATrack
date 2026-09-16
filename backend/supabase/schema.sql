-- ──────────────────────────────────────────────────────────
-- FATrack Subscriptions & Financial Advisor Premium Schema
-- Run this in Supabase SQL Editor
-- ──────────────────────────────────────────────────────────

-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',                  -- 'free' | 'premium_monthly' | 'premium_yearly'
  status TEXT NOT NULL DEFAULT 'active',               -- 'active' | 'expired' | 'cancelled' | 'pending'
  midtrans_order_id TEXT,
  midtrans_transaction_id TEXT,
  payment_type TEXT,
  amount INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON public.subscriptions(midtrans_order_id);

-- 2. Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own subscription
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypasses RLS automatically, but we can also permit insert/update via service role.

-- 3. Optional trigger to auto-create free subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, started_at, expires_at)
  VALUES (new.id, 'free', 'active', NOW(), NULL)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute upon user creation
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();
