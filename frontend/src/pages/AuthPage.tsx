import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, loginDemo, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await register(email, password, name || 'Pengguna FATrack');
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          navigate('/onboarding');
        }
      } else {
        const res = await login(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = () => {
    loginDemo();
    navigate('/dashboard');
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await loginWithGoogle();
    if (res.error) {
      setErrorMsg(res.error);
      setIsSubmitting(false);
    }
    // On success with real Supabase, OAuth redirect occurs; demo mode falls through to dashboard via user effect
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <button className="auth-brand" type="button" onClick={() => navigate('/')}>
          <span className="avatar">FA</span>
          <b>FATRACK</b>
          <i>/</i>
          <span>PERSONAL FINANCE ADVISOR</span>
        </button>

        <div className="auth-card">
          <small className="accent">
            {mode === 'register' ? '01 / REGISTRASI AKUN' : '02 / IDENTIFIKASI PENGGUNA'}
          </small>
          <h1>{mode === 'register' ? 'BUAT AKUN FATRACK.' : 'MASUK KE FATRACK.'}</h1>
          <p>
            {mode === 'register'
              ? 'Mulai navigasi keuangan Anda dengan formula dan rekomendasi konkret.'
              : 'Akses dashboard finansial dan riwayat pengeluaran harian Anda.'}
          </p>

          {errorMsg && (
            <div className="auth-error-box">
              <Icon name="alert" size={16} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label>
                NAMA LENGKAP
                <input
                  type="text"
                  placeholder="Misal: Andi Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            <label>
              ALAMAT EMAIL
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              KATA SANDI
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button className="pill dark" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'MEMPROSES...'
                : mode === 'register'
                ? <span className="inline-flex items-center gap-1.5">DAFTAR & SETUP PROFIL <Icon name="arrowRight" size={14} /></span>
                : <span className="inline-flex items-center gap-1.5">MASUK KE DASHBOARD <Icon name="arrowRight" size={14} /></span>}
            </button>
          </form>

          <div className="auth-or-divider">
            <span>ATAU</span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogle}
            disabled={isSubmitting}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21.8 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3a10 10 0 0 0 3-7.7Z" fill="#4285F4" />
              <path d="M12 22c2.7 0 5-.9 6.7-2.5l-3.3-2.6c-.9.6-2 .9-3.4.9a5.9 5.9 0 0 1-5.5-4H3.1v2.7A10 10 0 0 0 12 22Z" fill="#34A853" />
              <path d="M6.5 13.8a6 6 0 0 1 0-3.6V7.5H3.1a10 10 0 0 0 0 9l3.4-2.7Z" fill="#FBBC05" />
              <path d="M12 6.2c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2 10 10 0 0 0 3.1 7.5l3.4 2.7A5.9 5.9 0 0 1 12 6.2Z" fill="#EA4335" />
            </svg>
            <span>{mode === 'register' ? 'DAFTAR DENGAN GOOGLE' : 'MASUK DENGAN GOOGLE'}</span>
          </button>

          <div className="auth-demo-divider">
            <button
              type="button"
              className="pill dark auth-demo-btn"
              onClick={handleDemo}
            >
              <span className="inline-flex items-center gap-1.5">COBA INSTAN DENGAN DEMO MODE <Icon name="arrowRight" size={14} /></span>
            </button>
          </div>

          <p className="auth-switch">
            {mode === 'register' ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setErrorMsg(null);
              }}
            >
              {mode === 'register' ? 'MASUK' : 'DAFTAR SEKARANG'}
            </button>
          </p>
        </div>

        <small className="auth-note">
          DATA FINANSIAL TERLINDUNGI SUPABASE RLS / SISTEM ENKRIPSI PROTOKOL
        </small>
      </section>

      <aside className="auth-aside">
        <small>SISTEM PENASIHAT KEUANGAN ANAK MUDA</small>
        <h2>
          STRUKTUR NYATA
          <br />
          UNTUK MASA DEPAN
          <br />
          YANG PASTI.
        </h2>
        <div>
          <b>01 / BATAS JAJAN HARIAN</b>
          <p>Ketahui pasti nominal aman yang bisa Anda belanjakan setiap hari.</p>
        </div>
        <div>
          <b>02 / STANDAR SEWA KOST</b>
          <p>Cegah overspend pada sewa tempat tinggal di atas batas 25% gaji.</p>
        </div>
        <div>
          <b>03 / PAKET MINIMARKET</b>
          <p>Katalog estimasi belanja bahan pokok untuk menjaga pengeluaran makan.</p>
        </div>
      </aside>
    </main>
  );
};
