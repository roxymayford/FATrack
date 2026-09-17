import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Icon } from './Icon';

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
      <div className="sub-gate-loading">
        <div className="status-modal__spinner" />
        <small>MEMUAT STATUS LANGGANAN...</small>
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
    <div className="sub-gate">
      {/* Top Banner Tag */}
      <div className="sub-gate__top">
        <div className="sub-gate__top-label">
          <span className="sub-gate__top-dot"></span>
          <span className="sub-gate__top-text">
            PREMIUM ADVISOR GATEWAY
          </span>
        </div>
        <span className="sub-gate__status">STATUS: FREE TRACKER</span>
      </div>

      <div className="sub-gate__grid">
        <div>
          <h2 className="sub-gate__title">
            {title}
          </h2>
          <p className="sub-gate__desc">
            {description}
          </p>

          {/* Feature highlights comparison */}
          <div className="sub-gate__compare">
            <div className="sub-gate__compare-cell sub-gate__compare-cell--free">
              <span className="sub-gate__compare-label">MODE ANDA SEKARANG</span>
              <div className="sub-gate__compare-val">
                <span className="sub-gate__compare-icon--check"><Icon name="check" size={14} /></span> Money Tracker (Pencatatan Dasar)
              </div>
            </div>
            <div className="sub-gate__compare-cell sub-gate__compare-cell--premium">
              <span className="sub-gate__compare-label">DENGAN {featureName.toUpperCase()}</span>
              <div className="sub-gate__compare-val">
                <span className="sub-gate__compare-icon--star"><Icon name="star" size={14} /></span> Safe-to-Spend & Analisis Cerdas
              </div>
            </div>
          </div>
        </div>

        <div className="sub-gate__cta-col">
          <Link to="/subscription" className="sub-gate__cta-primary">
            <span className="inline-flex items-center justify-center gap-2">
              Aktifkan Advisor (Mulai Rp 29.900) <Icon name="arrowRight" size={15} />
            </span>
          </Link>
          <Link to="/transaksi" className="sub-gate__cta-secondary">
            Kembali ke Money Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
