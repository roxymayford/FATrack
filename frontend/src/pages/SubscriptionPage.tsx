import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, SubscriptionPlan } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Header Banner */}
      <div className="border-b-2 border-neutral-900 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-500 block mb-1">
              PAKET & LANGGANAN
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-neutral-900">
              Upgrade ke Financial Advisor
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-500 uppercase">Status Akun:</span>
            <span
              className={`px-3 py-1 font-mono font-bold text-xs uppercase tracking-wider ${
                isPremium
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-200 text-neutral-800'
              }`}
            >
              {isPremium ? '★ PREMIUM ADVISOR' : 'FREE TRACKER'}
            </span>
          </div>
        </div>
        <p className="mt-3 text-neutral-600 font-sans max-w-2xl text-sm md:text-base leading-relaxed">
          Gunakan FATrack sebagai pencatat pengeluaran gratis, atau buka kekuatan penuh rekomendasi finansial 
          berbasis algoritma Safe-to-Spend, formula 50/30/20, dan batas sewa kost proporsional dengan Midtrans Snap.
        </p>
      </div>

      {/* Notification Modal / Alert */}
      {modalMessage && (
        <div
          className={`p-4 border-2 font-mono text-sm flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            modalMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-900 text-emerald-900'
              : modalMessage.type === 'error'
              ? 'bg-rose-50 border-rose-900 text-rose-900'
              : 'bg-amber-50 border-amber-900 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {modalMessage.type === 'success' ? '✓' : modalMessage.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span>{modalMessage.text}</span>
          </div>
          <button
            onClick={() => setModalMessage(null)}
            className="font-bold text-xs uppercase underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Active Subscription Status Banner if Premium */}
      {isPremium && (
        <div className="p-6 border-2 border-emerald-800 bg-emerald-50/60 shadow-[4px_4px_0px_0px_rgba(6,95,70,1)] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-1">
              STATUS LANGGANAN ANDA AKTIF
            </div>
            <div className="text-lg font-bold text-neutral-900">
              Paket:{' '}
              {subscription.plan === 'premium_yearly'
                ? 'FATrack Advisor Tahunan'
                : 'FATrack Advisor Bulanan'}
            </div>
            {subscription.expiresAt && (
              <div className="text-xs font-mono text-neutral-600 mt-1">
                Berlaku hingga:{' '}
                {new Date(subscription.expiresAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/alokasi')}
              className="px-4 py-2 font-mono font-bold text-xs uppercase bg-neutral-900 text-white hover:bg-neutral-800 transition"
            >
              Buka Fitur Alokasi →
            </button>
            <button
              onClick={async () => {
                await resetToFree();
                setModalMessage({ type: 'info', text: 'Akun dikembalikan ke Mode Gratis.' });
              }}
              className="px-3 py-2 font-mono text-xs uppercase text-neutral-500 hover:text-neutral-900 underline"
            >
              Reset ke Free (Testing)
            </button>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Free Tier */}
        <div
          className={`border-2 border-neutral-900 p-6 flex flex-col justify-between bg-white ${
            !isPremium ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'opacity-85'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-neutral-100 text-neutral-800 border border-neutral-300">
                PAKET DASAR
              </span>
              {!isPremium && (
                <span className="text-xs font-mono font-bold text-emerald-700">AKTIF</span>
              )}
            </div>
            <h3 className="text-xl font-black uppercase text-neutral-900">Money Tracker</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-black text-neutral-900">Rp 0</span>
              <span className="text-xs font-mono text-neutral-500"> / selamanya</span>
            </div>
            <p className="text-xs text-neutral-600 font-sans mb-6">
              Pencatatan keuangan harian mandiri tanpa rekomendasi analitik mendalam.
            </p>

            <div className="space-y-3 pt-4 border-t border-neutral-200 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600 font-bold">✔</span> Catat transaksi pemasukan & pengeluaran
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600 font-bold">✔</span> Riwayat transaksi dan filter tanggal
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600 font-bold">✔</span> Dashboard ringkasan arus kas
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="font-bold">✕</span> Kalkulator Safe-to-Spend harian
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="font-bold">✕</span> Alokasi 50/30/20 adaptif
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="font-bold">✕</span> Rekomendasi sewa kost & belanja
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-200">
            <button
              disabled={!isPremium}
              onClick={async () => {
                await resetToFree();
                setModalMessage({ type: 'info', text: 'Beralih ke mode Money Tracker Gratis.' });
              }}
              className={`w-full py-3 font-mono font-bold text-xs uppercase tracking-wider border-2 border-neutral-900 ${
                !isPremium
                  ? 'bg-neutral-100 text-neutral-400 cursor-default'
                  : 'bg-white text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {!isPremium ? 'Paket Aktif Saat Ini' : 'Kembali ke Free'}
            </button>
          </div>
        </div>

        {/* Card 2: Premium Monthly */}
        <div
          className={`border-2 border-neutral-900 p-6 flex flex-col justify-between bg-white relative ${
            isPremium && subscription.plan === 'premium_monthly'
              ? 'shadow-[6px_6px_0px_0px_rgba(6,95,70,1)] border-emerald-700'
              : 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                POPULER
              </span>
              {isPremium && subscription.plan === 'premium_monthly' && (
                <span className="text-xs font-mono font-bold text-emerald-700">AKTIF</span>
              )}
            </div>
            <h3 className="text-xl font-black uppercase text-neutral-900">Advisor Bulanan</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-black text-neutral-900">Rp 29.900</span>
              <span className="text-xs font-mono text-neutral-500"> / 30 hari</span>
            </div>
            <p className="text-xs text-neutral-600 font-sans mb-6">
              Cocok untuk first-jobber yang ingin mengontrol jajan harian dan budgeting adaptif.
            </p>

            <div className="space-y-3 pt-4 border-t border-neutral-200 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600 font-bold">✔</span> Semua fitur Money Tracker
              </div>
              <div className="flex items-center gap-2 text-neutral-800 font-bold text-neutral-900">
                <span className="text-amber-500 font-bold">★</span> Formula Safe-to-Spend harian
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-amber-500 font-bold">★</span> Alokasi 50/30/20 adaptif
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-amber-500 font-bold">★</span> Plafon rekomendasi sewa kost 25%
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-amber-500 font-bold">★</span> Rekomendasi belanja minimarket riil
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-amber-500 font-bold">★</span> Financial Health Score (0–100)
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-200">
            <button
              disabled={processing || (isPremium && subscription.plan === 'premium_monthly')}
              onClick={() => handleSelectPlanAndPay('premium_monthly')}
              className={`w-full py-3 font-mono font-bold text-xs uppercase tracking-wider border-2 border-neutral-900 transition-all ${
                isPremium && subscription.plan === 'premium_monthly'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-[3px_3px_0px_0px_rgba(245,158,11,1)]'
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
          className={`border-2 border-neutral-900 p-6 flex flex-col justify-between bg-amber-50/40 relative ${
            isPremium && subscription.plan === 'premium_yearly'
              ? 'shadow-[6px_6px_0px_0px_rgba(6,95,70,1)] border-emerald-700'
              : 'shadow-[6px_6px_0px_0px_rgba(245,158,11,1)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-neutral-900 text-amber-300">
                HEMAT 30%
              </span>
              {isPremium && subscription.plan === 'premium_yearly' && (
                <span className="text-xs font-mono font-bold text-emerald-700">AKTIF</span>
              )}
            </div>
            <h3 className="text-xl font-black uppercase text-neutral-900">Advisor Tahunan</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-black text-neutral-900">Rp 249.000</span>
              <span className="text-xs font-mono text-neutral-500"> / tahun</span>
            </div>
            <p className="text-xs text-neutral-600 font-sans mb-6">
              Investasi cerdas untuk stabilitas finansial 1 tahun penuh. Hemat Rp 109.800 dibandingkan bulanan.
            </p>

            <div className="space-y-3 pt-4 border-t border-neutral-300 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600 font-bold">✔</span> Semua fitur Advisor Bulanan
              </div>
              <div className="flex items-center gap-2 text-neutral-800 font-bold text-neutral-900">
                <span className="text-amber-600 font-bold">★</span> Hemat 30% dari biaya bulanan
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-amber-600 font-bold">★</span> Akses awal ke rekomendasi investasi
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-amber-600 font-bold">★</span> Ekspor laporan keuangan tahunan
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="text-amber-600 font-bold">★</span> Prioritas dukungan pengguna
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-300">
            <button
              disabled={processing || (isPremium && subscription.plan === 'premium_yearly')}
              onClick={() => handleSelectPlanAndPay('premium_yearly')}
              className={`w-full py-3 font-mono font-bold text-xs uppercase tracking-wider border-2 border-neutral-900 transition-all ${
                isPremium && subscription.plan === 'premium_yearly'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-amber-500 text-neutral-900 hover:bg-amber-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
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
      <div className="border border-neutral-300 bg-white p-6 text-xs text-neutral-600 space-y-2">
        <div className="font-mono font-bold uppercase text-neutral-800 flex items-center gap-2">
          <span>🔒 Integrasi Pembayaran Resmi Midtrans</span>
        </div>
        <p className="leading-relaxed font-sans">
          Transaksi diproses dengan aman melalui Midtrans Snap Gateway yang mendukung QRIS (GoPay, OVO, Dana, ShopeePay), 
          BCA Virtual Account, Mandiri Bill, BNI, BRI, serta kartu kredit dan debit berstandar PCI-DSS.
        </p>
      </div>
    </div>
  );
}
