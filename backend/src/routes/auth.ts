import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email dan kata sandi wajib diisi.',
    });
  }

  // Placeholder register logic
  return res.status(201).json({
    status: 'success',
    message: 'Akun berhasil didaftarkan.',
    user: { email, name: name || 'Pengguna Kontor' },
  });
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email dan kata sandi wajib diisi.',
    });
  }

  // Placeholder login logic
  return res.status(200).json({
    status: 'success',
    message: 'Autentikasi berhasil.',
    token: 'kontor_session_dummy_token',
    user: { email },
  });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'fail',
      message: 'Alamat email wajib diisi.',
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Tautan pengaturan ulang kata sandi telah dikirimkan ke email Anda.',
  });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    status: 'success',
    user: req.user,
  });
});

