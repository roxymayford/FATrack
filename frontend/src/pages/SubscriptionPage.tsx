import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, SubscriptionPlan } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';

export function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    subscription,
    isPremium,
    plans,
    createSnapTransaction,
    activateSubscription,
    resetToFree,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string>('premium_monthly');
  const [processing, setProcessing] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Format currency
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const handleSelectPlanAndPay = async (planKey: string) => {
    setSelectedPlan(planKey);
    setProcessing(true);
    setModalMessage(null);

    try {
      const snapResult = await createSnapTransaction(planKey);

      // 1. Check if window.snap is available and valid token exists
      if (window.snap && snapResult.token && !snapResult.isMock) {
        window.snap.pay(snapResult.token, {
          onSuccess: async (result) => {
            console.log('[Midtrans Snap Success]', result);
            await activateSubscription(planKey);
            setModalMessage({
              type: 'success',
              text: 'Pembayaran berhasil diverifikasi! Fitur Financial Advisor Anda telah aktif.',
            });
            setProcessing(false);
          },
          onPending: async (result) => {
            console.log('[Midtrans Snap Pending]', result);
            setModalMessage({
              type: 'info',
              text: 'Menunggu penyelesaian pembayaran. Silakan selesaikan transaksi sesuai instruksi.',
            });
            setProcessing(false);
          },
          onError: (err) => {
            console.error('[Midtrans Snap Error]', err);
            setModalMessage({
              type: 'error',
              text: 'Transaksi gagal atau dibatalkan. Silakan coba kembali.',
            });
            setProcessing(false);
          },
          onClose: () => {
            setProcessing(false);
          },
        });
      } else {
        // 2. Demo / Sandbox Mode Fallback
        // Simulate immediate sandbox payment verification
        await activateSubscription(planKey);
        setModalMessage({
          type: 'success',
          text: 'Mode Sandbox/Dev: Pembayaran berhasil diverifikasi secara instan! Fitur Financial Advisor telah aktif.',
        });
        setProcessing(false);
      }
    } catch (err: any) {
      console.error(err);
      setModalMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat memulai pembayaran.',
      });
      setProcessing(false);
    }
  };

  return (
    <div className="subscription-page">
      {/* Header Banner */}
      <div className="subscription-header">
        <div>
          <span className="subscription-header__label">
            PAKET & LANGGANAN
          </span>
          <h1>Upgrade ke Financial Advisor</h1>
          <p className="subscription-header__desc">
            Gunakan FATrack sebagai pencatat pengeluaran gratis, atau buka kekuatan penuh rekomendasi finansial 
            berbasis algoritma Safe-to-Spend, formula 50/30/20, dan batas sewa kost proporsional dengan Midtrans Snap.
          </p>
        </div>
        <div className="subscription-header__status">
          <span className="subscription-header__status-label">Status Akun:</span>
          <span
            className={`badge-plan ${isPremium ? 'badge-plan--pro' : 'badge-plan--free'}`}
          >
            {isPremium ? (
              <span className="inline-flex items-center gap-1"><Icon name="star" size={11} /> PREMIUM ADVISOR</span>
            ) : 'FREE TRACKER'}
          </span>
        </div>
      </div>

      {/* Notification Modal / Alert */}
      {modalMessage && (
        <div className={`sub-alert sub-alert--${modalMessage.type}`}>
          <div className="sub-alert__content">
            <span>
              <Icon name={modalMessage.type === 'success' ? 'check' : modalMessage.type === 'error' ? 'x' : 'info'} size={15} />
            </span>
            <span>{modalMessage.text}</span>
          </div>
          <button
            onClick={() => setModalMessage(null)}
            className="sub-alert__close"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Active Subscription Status Banner if Premium */}
      {isPremium && (
        <div className="sub-active-banner">
          <div>
            <div className="sub-active-banner__label">
              STATUS LANGGANAN ANDA AKTIF
            </div>
            <div className="sub-active-banner__plan">
              Paket:{' '}
              {subscription.plan === 'premium_yearly'
                ? 'FATrack Advisor Tahunan'
                : 'FATrack Advisor Bulanan'}
            </div>
            {subscription.expiresAt && (
              <div className="sub-active-banner__expiry">
                Berlaku hingga:{' '}
                {new Date(subscription.expiresAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
          <div className="sub-active-banner__actions">
            <button
              onClick={() => navigate('/alokasi')}
              className="sub-active-banner__btn"
            >
              <span className="inline-flex items-center gap-1.5">Buka Fitur Alokasi <Icon name="arrowRight" size={13} /></span>
            </button>
            <button
              onClick={async () => {
                await resetToFree();
                setModalMessage({ type: 'info', text: 'Akun dikembalikan ke Mode Gratis.' });
              }}
              className="sub-active-banner__reset"
            >
              Reset ke Free (Testing)
            </button>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="plans-grid">
        {/* Card 1: Free Tier */}
        <div
          className={`plan-card ${!isPremium ? 'plan-card--active' : 'plan-card--dimmed'}`}
        >
          <div>
            <div className="plan-card__head">
              <span className="plan-card__tag">PAKET DASAR</span>
              {!isPremium && (
                <span className="plan-card__status">AKTIF</span>
              )}
            </div>
            <h3 className="plan-card__title">Money Tracker</h3>
            <div className="plan-card__price">
              <span className="plan-card__price-val">Rp 0</span>
              <span className="plan-card__price-unit"> / selamanya</span>
            </div>
            <p className="plan-card__desc">
              Pencatatan keuangan harian mandiri tanpa rekomendasi analitik mendalam.
            </p>

            <ul className="plan-card__features">
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--check"><Icon name="check" size={14} /></span> Catat transaksi pemasukan & pengeluaran
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--check"><Icon name="check" size={14} /></span> Riwayat transaksi dan filter tanggal
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--check"><Icon name="check" size={14} /></span> Dashboard ringkasan arus kas
              </li>
              <li className="plan-card__feature plan-card__feature--locked">
                <span className="plan-card__feature-icon plan-card__feature-icon--x"><Icon name="x" size={14} /></span> Kalkulator Safe-to-Spend harian
              </li>
              <li className="plan-card__feature plan-card__feature--locked">
                <span className="plan-card__feature-icon plan-card__feature-icon--x"><Icon name="x" size={14} /></span> Alokasi 50/30/20 adaptif
              </li>
              <li className="plan-card__feature plan-card__feature--locked">
                <span className="plan-card__feature-icon plan-card__feature-icon--x"><Icon name="x" size={14} /></span> Rekomendasi sewa kost & belanja
              </li>
            </ul>
          </div>

          <div className="plan-card__footer">
            <button
              disabled={!isPremium}
              onClick={async () => {
                await resetToFree();
                setModalMessage({ type: 'info', text: 'Beralih ke mode Money Tracker Gratis.' });
              }}
              className={`plan-card__btn ${!isPremium ? 'plan-card__btn--disabled' : 'plan-card__btn--outline'}`}
            >
              {!isPremium ? 'Paket Aktif Saat Ini' : 'Kembali ke Free'}
            </button>
          </div>
        </div>

        {/* Card 2: Premium Monthly */}
        <div
          className={`plan-card ${
            isPremium && subscription.plan === 'premium_monthly'
              ? 'plan-card--active'
              : ''
          }`}
        >
          <div>
            <div className="plan-card__head">
              <span className="plan-card__tag plan-card__tag--popular">POPULER</span>
              {isPremium && subscription.plan === 'premium_monthly' && (
                <span className="plan-card__status">AKTIF</span>
              )}
            </div>
            <h3 className="plan-card__title">Advisor Bulanan</h3>
            <div className="plan-card__price">
              <span className="plan-card__price-val">Rp 29.900</span>
              <span className="plan-card__price-unit"> / 30 hari</span>
            </div>
            <p className="plan-card__desc">
              Cocok untuk first-jobber yang ingin mengontrol jajan harian dan budgeting adaptif.
            </p>

            <ul className="plan-card__features">
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--check"><Icon name="check" size={14} /></span> Semua fitur Money Tracker
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Formula Safe-to-Spend harian
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Alokasi 50/30/20 adaptif
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Plafon rekomendasi sewa kost 25%
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Rekomendasi belanja minimarket riil
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Financial Health Score (0â€“100)
              </li>
            </ul>
          </div>

          <div className="plan-card__footer">
            <button
              disabled={processing || (isPremium && subscription.plan === 'premium_monthly')}
              onClick={() => handleSelectPlanAndPay('premium_monthly')}
              className={`plan-card__btn ${
                isPremium && subscription.plan === 'premium_monthly'
                  ? 'plan-card__btn--active'
                  : 'plan-card__btn--dark'
              }`}
            >
              {processing && selectedPlan === 'premium_monthly'
                ? 'Memproses...'
                : isPremium && subscription.plan === 'premium_monthly'
                ? 'Paket Anda Sedang Aktif'
                : 'Pilih Bulanan (Rp 29.900)'}
            </button>
          </div>
        </div>

        {/* Card 3: Premium Yearly */}
        <div
          className={`plan-card plan-card--featured ${
            isPremium && subscription.plan === 'premium_yearly'
              ? 'plan-card--active'
              : ''
          }`}
        >
          <div>
            <div className="plan-card__head">
              <span className="plan-card__tag plan-card__tag--best">HEMAT 30%</span>
              {isPremium && subscription.plan === 'premium_yearly' && (
                <span className="plan-card__status">AKTIF</span>
              )}
            </div>
            <h3 className="plan-card__title">Advisor Tahunan</h3>
            <div className="plan-card__price">
              <span className="plan-card__price-val">Rp 249.000</span>
              <span className="plan-card__price-unit"> / tahun</span>
            </div>
            <p className="plan-card__desc">
              Investasi cerdas untuk stabilitas finansial 1 tahun penuh. Hemat Rp 109.800 dibandingkan bulanan.
            </p>

            <ul className="plan-card__features">
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--check"><Icon name="check" size={14} /></span> Semua fitur Advisor Bulanan
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Hemat 30% dari biaya bulanan
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Akses awal ke rekomendasi investasi
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Ekspor laporan keuangan tahunan
              </li>
              <li className="plan-card__feature">
                <span className="plan-card__feature-icon plan-card__feature-icon--star"><Icon name="star" size={14} /></span> Prioritas dukungan pengguna
              </li>
            </ul>
          </div>

          <div className="plan-card__footer">
            <button
              disabled={processing || (isPremium && subscription.plan === 'premium_yearly')}
              onClick={() => handleSelectPlanAndPay('premium_yearly')}
              className={`plan-card__btn ${
                isPremium && subscription.plan === 'premium_yearly'
                  ? 'plan-card__btn--active'
                  : 'plan-card__btn--orange'
              }`}
            >
              {processing && selectedPlan === 'premium_yearly'
                ? 'Memproses...'
                : isPremium && subscription.plan === 'premium_yearly'
                ? 'Paket Anda Sedang Aktif'
                : 'Pilih Tahunan (Hemat 30%)'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateway Information footer */}
      <div className="sub-payment-info">
        <div className="sub-payment-info__title">
          INTEGRASI PEMBAYARAN RESMI MIDTRANS
        </div>
        <p>
          Transaksi diamankan melalui gateway Midtrans (PT Midtrans Indonesia) dengan enkripsi tingkat perbankan. 
          Mendukung pembayaran via GoPay, QRIS, BCA Virtual Account, Mandiri Bill, BNI, BRI, serta kartu kredit dan debit berstandar PCI-DSS.
        </p>
      </div>
    </div>
  );

}
