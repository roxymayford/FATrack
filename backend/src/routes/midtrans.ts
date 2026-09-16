import { Router, Request, Response } from 'express';
import { verifyMidtransSignature } from '../lib/midtrans.js';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';

export const midtransRouter = Router();

/**
 * POST /api/midtrans/webhook
 * Handles Midtrans payment notification callback
 */
midtransRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const notification = req.body;
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = notification;

    console.log(`[Midtrans Webhook] Received notification for order: ${order_id}, status: ${transaction_status}`);

    // Verify Midtrans Signature
    if (signature_key) {
      const isValid = verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);
      if (!isValid) {
        console.warn(`[Midtrans Webhook] Invalid signature key for order: ${order_id}`);
        return res.status(403).json({ status: 'fail', message: 'Invalid signature key' });
      }
    }

    // Determine target subscription status
    let subStatus: 'active' | 'pending' | 'cancelled' | 'expired' = 'pending';
    let isSuccess = false;

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        subStatus = 'pending';
      } else if (fraud_status === 'accept') {
        subStatus = 'active';
        isSuccess = true;
      }
    } else if (transaction_status === 'settlement') {
      subStatus = 'active';
      isSuccess = true;
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
      subStatus = 'cancelled';
    } else if (transaction_status === 'expire') {
      subStatus = 'expired';
    } else if (transaction_status === 'pending') {
      subStatus = 'pending';
    }

    // Calculate expiry date if payment succeeded
    const isYearly = order_id?.includes('-Y-') || order_id?.includes('yearly');
    const durationDays = isYearly ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    if (isSupabaseConfigured && supabaseAdmin) {
      const updatePayload: Record<string, any> = {
        status: subStatus,
        payment_type: payment_type || null,
        midtrans_transaction_id: transaction_id || null,
        updated_at: new Date().toISOString(),
      };

      if (isSuccess) {
        updatePayload.started_at = new Date().toISOString();
        updatePayload.expires_at = expiresAt.toISOString();
      }

      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update(updatePayload)
        .eq('midtrans_order_id', order_id)
        .select();

      if (error) {
        console.warn('[Midtrans Webhook] DB Update Note:', error.message);
      } else {
        console.log(`[Midtrans Webhook] Subscription updated successfully for order ${order_id}:`, data);
      }
    } else {
      console.log(`[Midtrans Webhook] Supabase not connected. Processed in local/memory mode for ${order_id}.`);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Notification processed successfully',
      order_id,
      subscription_status: subStatus,
    });
  } catch (err: any) {
    console.error('[Midtrans Webhook Error]:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});
