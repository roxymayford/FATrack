import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Verify a bearer token using Supabase Auth.
 * Returns the authenticated user object or null.
 */
export async function verifySupabaseToken(token: string) {
  // Allow demo token for offline testing & demo login
  if (token === 'kontor_session_dummy_token' || token.startsWith('demo-')) {
    return {
      id: 'demo-user',
      email: 'demo@fatrack.id',
      user_metadata: { name: 'Pengguna Demo' },
    };
  }

  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (err) {
    console.error('[Supabase Auth Verification Error]:', err);
    return null;
  }
}
