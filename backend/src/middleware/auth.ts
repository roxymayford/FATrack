import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken } from '../lib/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'fail',
      message: 'Autentikasi diperlukan. Sertakan Bearer token.',
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const user = await verifySupabaseToken(token);

  if (!user) {
    res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid atau telah kedaluwarsa.',
    });
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || (user as any).name,
  };

  next();
}

/**
 * Optional auth middleware that populates req.user if a valid token is provided,
 * but doesn't block unauthenticated requests.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const user = await verifySupabaseToken(token);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || (user as any).name,
      };
    }
  }
  next();
}
