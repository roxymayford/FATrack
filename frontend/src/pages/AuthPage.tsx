import { FormEvent, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { StatusModal } from '../components/StatusModal';

export type AuthMode = 'login' | 'register' | 'forgot';

type AuthPageProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode | null) => void;
  onAuthenticated?: () => void;
};

export function AuthPage({ mode, onModeChange, onAuthenticated }: AuthPageProps) {
  const [statusModal, setStatusModal] = useState<'loading' | 'not-found' | null>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.auth-brand, .auth-card > *, .auth-note', {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
      });
      gsap.from('.auth-aside > *', {
        x: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.15,
        ease: 'power3.out',
      });
    });
    return () => context.revert();
  }, [mode]);

  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';

  const title = isRegister
    ? 'BUAT AKUN KONTOR.'
    : isForgot
    ? 'ATUR ULANG AKSES.'
    : 'MASUK KE KONTOR.';

  const description = isRegister
    ? 'Mulai pencatatan aset dengan struktur yang presisi.'
    : isForgot
    ? 'Masukkan email untuk menerima tautan pengaturan ulang kata sandi.'
    : 'Akses ledger dan alokasi modal Anda.';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isForgot) {
      onAuthenticated?.();
    } else {
      setStatusModal('loading');
      window.setTimeout(() => setStatusModal('not-found'), 2200);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <button className="auth-brand" type="button" onClick={() => onModeChange(null)}>
          <span className="avatar">K</span>
          <b>KONTOR</b>
          <i>/</i>
          <span>CAPITAL TRACKER</span>
        </button>

        <div className="auth-card">
          <small className="accent">
            {isRegister ? 'REGISTRASI AKUN' : isForgot ? 'PEMULIHAN AKSES' : 'IDENTIFIKASI PENGGUNA'}
          </small>
          <h1>{title}</h1>
          <p>{description}</p>

          <form onSubmit={handleSubmit}>
            <label>
              ALAMAT EMAIL
              <input type="email" autoComplete="email" placeholder="nama@perusahaan.id" required />
            </label>

            {isRegister && (
              <label>
                NAMA LENGKAP
                <input type="text" autoComplete="name" placeholder="Nama Anda" required />
              </label>
            )}

            {!isForgot && (
              <label>
                KATA SANDI
                <input
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  required
                />
              </label>
            )}

            <button className="pill dark" type="submit">
              {isRegister ? 'BUAT AKUN' : isForgot ? 'KIRIM TAUTAN PEMULIHAN' : 'MASUK KE DASHBOARD'}
            </button>
          </form>

          {!isForgot && (
            <button className="text-link" type="button" onClick={() => onModeChange('forgot')}>
              LUPA KATA SANDI?
            </button>
          )}

          <p className="auth-switch">
            {isRegister ? 'Sudah memiliki akun?' : isForgot ? 'Ingat kata sandi?' : 'Belum memiliki akun?'}{' '}
            <button
              type="button"
              onClick={() => onModeChange(isRegister || isForgot ? 'login' : 'register')}
            >
              {isRegister ? 'MASUK' : isForgot ? 'KEMBALI KE MASUK' : 'DAFTAR SEKARANG'}
            </button>
          </p>
        </div>

        <small className="auth-note">DATA LOKAL TERENKRIPSI / PROTOKOL PRIVASI KONTOR</small>
      </section>

      {statusModal && (
        <StatusModal kind={statusModal} onClose={() => setStatusModal(null)} />
      )}

      <aside className="auth-aside">
        <small>PROTOKOL AKURASI TINGGI / 2025.1</small>
        <h2>KEJELASAN PENUH UNTUK SETIAP KEPUTUSAN MODAL.</h2>
        <div>
          <b>01 / LEDGER TERSTRUKTUR</b>
          <p>Catat arus keuangan tanpa kehilangan konteks.</p>
        </div>
        <div>
          <b>02 / PRIVASI LOKAL</b>
          <p>Data Anda tetap berada dalam kendali Anda.</p>
        </div>
      </aside>
    </main>
  );
}
