import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, loginDemo, user } = useAuth();
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
              ⚠ {errorMsg}
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
                ? 'DAFTAR & SETUP PROFIL →'
                : 'MASUK KE DASHBOARD →'}
            </button>
          </form>

          <div className="auth-demo-divider">
            <button
              type="button"
              className="pill dark auth-demo-btn"
              onClick={handleDemo}
            >
              COBA INSTAN DENGAN DEMO MODE →
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
