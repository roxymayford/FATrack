import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import {
  UserProfile,
  BudgetSettings,
  getProfile,
  getBudgetSettings,
  saveBudgetSettings,
} from '../lib/storage';
import { AllocationPercentages, formatRupiah, calculateAllocation } from '../lib/calculator';
import { AllocationSlider } from '../components/AllocationSlider';
import { SubscriptionGate } from '../components/SubscriptionGate';
import { Icon } from '../components/Icon';

export const AllocationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [percentages, setPercentages] = useState<AllocationPercentages>({
    needs: 50,
    wants: 30,
    savings: 20,
  });
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.page-head-strip > *', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
      gsap.from('.slider-card', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.1,
        ease: 'power3.out',
      });
      gsap.from('.allocation-summary-sidebar', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });
    }, rootRef);

    return () => ctx.revert();
  }, [loading]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    Promise.all([getProfile(user.id), getBudgetSettings(user.id)]).then(([p, b]) => {
      if (p) setProfile(p);
      if (b) {
        setPercentages({
          needs: b.needs_percentage,
          wants: b.wants_percentage,
          savings: b.savings_percentage,
        });
      }
      setLoading(false);
    });
  }, [user, navigate]);

  const salary = profile?.monthly_salary || 5500000;
  const fixedExpenses = profile?.fixed_expenses || 1200000;

  const allocationResult = calculateAllocation(salary, fixedExpenses, percentages);

  const handleSave = async () => {
    if (!user) return;
    await saveBudgetSettings(user.id, {
      needs_percentage: percentages.needs,
      wants_percentage: percentages.wants,
      savings_percentage: percentages.savings,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <div className="status-modal__spinner" />
        <small>MEMUAT MODUL ALOKASI...</small>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="allocation-page-container">
      <SubscriptionGate
        title="Kalkulator Alokasi Finansial 50/30/20 Adaptif"
        description="Fitur ini adalah bagian dari modul Financial Advisor cerdas. Anda dapat menyesuaikan persentase kebutuhan, keinginan, dan tabungan serta menghitung Safe-to-Spend harian secara live setelah upgrade."
        featureName="Financial Advisor"
      >
        <div className="page-head-strip">
          <div>
            <small className="accent">MODUL 02 / ENGINE ALOKASI KEUANGAN</small>
            <h2>CUSTOMIZABLE FINANCIAL ADVISOR</h2>
            <p>
              Konfigurasikan batas rasio pengeluaran adaptif berbasis standar 50/30/20.
              Sesuaikan proporsi kebutuhan pokok, gaya hidup, dan investasi sesuai tujuan keuangan Anda.
            </p>
          </div>
          <div className="head-right-cta">
            {isSaved && <span className="save-success-tag inline-flex items-center gap-1"><Icon name="check" size={13} /> PENGATURAN DISIMPAN</span>}
            <button type="button" className="pill dark" onClick={handleSave}>
              SIMPAN PERUBAHAN
            </button>
          </div>
        </div>

        <div className="allocation-content-grid">
          <div className="allocation-main-card">
            <AllocationSlider
              percentages={percentages}
              onChange={setPercentages}
              monthlySalary={salary}
              fixedExpenses={fixedExpenses}
            />
          </div>

          <aside className="allocation-summary-sidebar terminal">
            <div className="terminal-head">
              <span className="terminal-pulse">■</span> HASIL KALKULASI ARUS KAS
              <span>LIVE SYNC</span>
            </div>

            <div className="terminal-body">
              <div className="worth terminal-card">
                <small>SAFE-TO-SPEND HARIAN</small>
                <strong>{formatRupiah(allocationResult.dailyLimit)} <small>/ hari</small></strong>
                <span>Batas aman belanja harian Anda</span>
              </div>

              <div className="twins terminal-card">
                <div>
                  <small>NEEDS (POKOK)</small>
                  <b>{formatRupiah(allocationResult.needsAmount)}</b>
                  <span>{percentages.needs}% dari sisa bersih</span>
                </div>
                <div>
                  <small>WANTS (LIFESTYLE)</small>
                  <b className="accent">{formatRupiah(allocationResult.wantsAmount)}</b>
                  <span>{percentages.wants}% dari sisa bersih</span>
                </div>
              </div>

              <div className="allocation terminal-card">
                <small>TARGET TABUNGAN & INVESTASI</small>
                <div style={{ margin: '8px 0' }}>
                  <strong className="green-text" style={{ fontSize: '24px' }}>
                    {formatRupiah(allocationResult.savingsAmount)}
                  </strong>
                </div>
                <span>
                  Porsi Tabungan: <b>{percentages.savings}%</b>
                  <i>
                    <em style={{ width: `${percentages.savings}%`, backgroundColor: '#008547' }} />
                  </i>
                </span>
                <span>
                  Sisa Hari Siklus: <b>{allocationResult.daysInCycle} Hari</b>
                </span>
              </div>
            </div>

            <div className="terminal-foot">
              <button
                type="button"
                className="tag-btn full-width"
                onClick={() => navigate('/rekomendasi')}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <span className="inline-flex items-center justify-center gap-1.5">LIHAT REKOMENDASI GAYA HIDUP <Icon name="arrowRight" size={14} /></span>
              </button>
            </div>
          </aside>
        </div>
      </SubscriptionGate>
    </div>
  );
};
