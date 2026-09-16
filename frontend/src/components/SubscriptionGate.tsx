import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SubscriptionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  featureName?: string;
}

export function SubscriptionGate({
  children,
  fallback,
  title = 'Fitur Eksklusif Financial Advisor',
  description = 'Tingkatkan akun Anda untuk membuka kalkulator alokasi adaptif, Safe-to-Spend harian, dan rekomendasi riil.',
  featureName = 'Financial Advisor',
}: SubscriptionGateProps) {
  const { isPremium, loading } = useSubscription();

  if (loading) {
    return (
      <div className="p-8 border border-neutral-200 bg-white rounded-none animate-pulse">
        <div className="h-4 bg-neutral-200 w-1/4 mb-4"></div>
        <div className="h-8 bg-neutral-100 w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-100 w-1/2"></div>
      </div>
    );
  }

  // If user is premium, render children directly
  if (isPremium) {
    return <>{children}</>;
  }

  // If custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default Swiss-Editorial style Paywall / Upgrade prompt
  return (
    <div className="relative overflow-hidden border-2 border-neutral-900 bg-neutral-50 p-6 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] my-6">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-amber-500 border border-neutral-900"></span>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-600">
            PREMIUM ADVISOR GATEWAY
          </span>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase bg-neutral-900 text-white tracking-wider">
          STATUS: FREE TRACKER
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            {title}
          </h2>
          <p className="text-neutral-700 leading-relaxed font-sans text-sm md:text-base">
            {description}
          </p>

          {/* Feature highlights comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 bg-white border border-neutral-300">
              <span className="text-neutral-400 font-bold block mb-1">MODE ANDA SEKARANG</span>
              <div className="font-bold text-neutral-800 flex items-center gap-1.5">
                <span className="text-emerald-600">✔</span> Money Tracker (Pencatatan Dasar)
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-300">
              <span className="text-amber-800 font-bold block mb-1">DENGAN {featureName.toUpperCase()}</span>
              <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="text-amber-600">★</span> Safe-to-Spend & Analisis Cerdas
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
          <Link
            to="/subscription"
            className="w-full text-center py-3.5 px-6 font-mono font-bold text-sm uppercase tracking-wider bg-neutral-900 text-white border-2 border-neutral-900 hover:bg-neutral-800 hover:shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] transition-all"
          >
            Aktifkan Advisor (Mulai Rp 29.900) →
          </Link>
          <Link
            to="/transaksi"
            className="w-full text-center py-2.5 px-4 font-mono font-bold text-xs uppercase tracking-wider text-neutral-600 hover:text-neutral-900 underline"
          >
            Kembali ke Money Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
