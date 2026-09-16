import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { snap, SUBSCRIPTION_PLANS, PlanType, isMidtransConfigured } from '../lib/midtrans.js';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';

export const subscriptionRouter = Router();

// In-memory store for fallback/demo mode when database is not connected
const demoSubscriptions = new Map<string, any>();

// GET /api/subscription/plans - Get all available plans
subscriptionRouter.get('/plans', (_req, res) => {
  res.json({
    status: 'success',
    data: Object.values(SUBSCRIPTION_PLANS),
    midtransConfigured: isMidtransConfigured,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
  });
});

// GET /api/subscription/status - Get current user subscription status
subscriptionRouter.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  // 1. Supabase Connected Mode
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.warn('[Subscription Status Warning]:', error.message);
        }
      } else if (data) {
        // Check if subscription has expired
        const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
        const isPremium = (data.plan === 'premium_monthly' || data.plan === 'premium_yearly') &&
          data.status === 'active' &&
          !isExpired;

        return res.json({
          status: 'success',
          data: {
            id: data.id,
            plan: data.plan,
            status: isExpired ? 'expired' : data.status,
            isPremium,
            startedAt: data.started_at,
            expiresAt: data.expires_at,
            midtransOrderId: data.midtrans_order_id,
          },
        });
      }
    } catch (err) {
      console.error('[Subscription DB Error]:', err);
    }
  }

  // 2. Demo / Fallback Mode (LocalStorage or In-Memory)
  const cached = demoSubscriptions.get(userId);
  if (cached) {
    const isExpired = cached.expiresAt ? new Date(cached.expiresAt) < new Date() : false;
    const isPremium = (cached.plan === 'premium_monthly' || cached.plan === 'premium_yearly') &&
      cached.status === 'active' &&
      !isExpired;

    return res.json({
      status: 'success',
      data: {
        ...cached,
        status: isExpired ? 'expired' : cached.status,
        isPremium,
      },
    });
  }

  return res.json({
    status: 'success',
    data: {
      plan: 'free',
      status: 'active',
      isPremium: false,
      expiresAt: null,
    },
  });
});

// POST /api/subscription/create - Create Midtrans Snap Transaction
subscriptionRouter.post('/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { plan: planKey } = req.body;
  const user = req.user!;

  if (!planKey || !(planKey in SUBSCRIPTION_PLANS)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Paket langganan tidak valid. Pilih "premium_monthly" atau "premium_yearly".',
    });
  }

  const selectedPlan = SUBSCRIPTION_PLANS[planKey as PlanType];
  const orderId = `FATRACK-${planKey === 'premium_yearly' ? 'Y' : 'M'}-${user.id.slice(0, 8)}-${Date.now()}`;

  const transactionParameters = {
    transaction_details: {
      order_id: orderId,
      gross_amount: selectedPlan.price,
    },
    customer_details: {
      first_name: user.name || 'Pengguna',
      email: user.email || 'user@fatrack.id',
    },
    item_details: [
      {
        id: selectedPlan.id,
        price: selectedPlan.price,
        quantity: 1,
        name: selectedPlan.name,
      },
    ],
  };

  try {
    let snapToken = '';
    let redirectUrl = '';
    let isMock = false;

    if (isMidtransConfigured) {
      try {
        const snapResponse = await snap.createTransaction(transactionParameters);
        snapToken = snapResponse.token;
        redirectUrl = snapResponse.redirect_url;
      } catch (midtransErr: any) {
        console.warn('[Midtrans Warning] Sandbox key unauthorized or rejected. Falling back to dev mock token:', midtransErr.message);
        snapToken = `mock_snap_token_${Date.now()}`;
        redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
        isMock = true;
      }
    } else {
      // Mock Snap token for development without Midtrans credentials
      snapToken = `mock_snap_token_${Date.now()}`;
      redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
      isMock = true;
    }

    // Save pending subscription in Supabase if configured and table exists
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('subscriptions').upsert(
          {
            user_id: user.id,
            plan: planKey,
            status: 'pending',
            midtrans_order_id: orderId,
            amount: selectedPlan.price,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      } catch (dbErr: any) {
        console.warn('[Supabase Warning] Pending subscription save:', dbErr.message);
      }
    }

    demoSubscriptions.set(user.id, {
      plan: planKey,
      status: 'pending',
      midtransOrderId: orderId,
      amount: selectedPlan.price,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        token: snapToken,
        redirectUrl,
        orderId,
        plan: selectedPlan,
        isMock: !isMidtransConfigured,
      },
    });
  } catch (err: any) {
    console.error('[Midtrans Create Error]:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Gagal membuat sesi pembayaran Midtrans.',
    });
  }
});

// POST /api/subscription/simulate-activate - Useful for demo / quick test without real webhook
subscriptionRouter.post('/simulate-activate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { plan: planKey } = req.body;
  const user = req.user!;

  const plan = SUBSCRIPTION_PLANS[(planKey as PlanType) || 'premium_monthly'] || SUBSCRIPTION_PLANS.premium_monthly;
  const durationDays = plan.durationDays;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from('subscriptions').upsert(
        {
          user_id: user.id,
          plan: plan.id,
          status: 'active',
          amount: plan.price,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.warn('[Supabase Warning] Subscriptions table not ready, saved in local memory:', error.message);
      }
    } catch (dbErr: any) {
      console.warn('[Supabase Warning] DB upsert failed:', dbErr.message);
    }
  }

  // Always update in-memory cache for immediate responsiveness
  demoSubscriptions.set(user.id, {
    plan: plan.id,
    status: 'active',
    amount: plan.price,
    startedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    isPremium: true,
  });

  return res.json({
    status: 'success',
    message: 'Subscription berhasil diaktifkan.',
    data: {
      plan: plan.id,
      status: 'active',
      isPremium: true,
      expiresAt: expiresAt.toISOString(),
    },
  });
});
