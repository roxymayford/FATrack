import midtransClient from 'midtrans-client';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY';
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

export const isMidtransConfigured = Boolean(
  process.env.MIDTRANS_SERVER_KEY &&
  !process.env.MIDTRANS_SERVER_KEY.includes('YOUR_SERVER_KEY') &&
  !process.env.MIDTRANS_SERVER_KEY.includes('demo')
);

// Pricing plans in IDR
export const SUBSCRIPTION_PLANS = {
  premium_monthly: {
    id: 'premium_monthly',
    name: 'FATrack Advisor - Bulanan',
    price: 29900,
    durationDays: 30,
    description: 'Akses penuh fitur Financial Advisor cerdas selama 30 hari',
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'FATrack Advisor - Tahunan (Hemat 30%)',
    price: 249000,
    durationDays: 365,
    description: 'Akses penuh fitur Financial Advisor cerdas selama 1 tahun',
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Initialize Snap client
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

/**
 * Verify notification signature key from Midtrans
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  if (!isMidtransConfigured) {
    // If not configured, in dev/demo mode allow test verification
    return true;
  }
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto.createHash('sha512').update(payload).digest('hex');
  return computedHash.toLowerCase() === signatureKey.toLowerCase();
}
