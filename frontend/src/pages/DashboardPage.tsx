import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  UserProfile,
  BudgetSettings,
  Transaction,
  getProfile,
  getBudgetSettings,
  getTransactions,
  addTransaction,
  deleteTransaction,
  aggregateByCategory,
} from '../lib/storage';
import {
  calculateAllocationWithPayday,
  calculateFinancialHealthScore,
  getDaysInCurrentCycle,
  getDayInCycle,
  formatRupiah,
} from '../lib/calculator';
import { DailyLimitCard } from '../components/DailyLimitCard';
import { AllocationChart } from '../components/AllocationChart';
import { BudgetGauge } from '../components/BudgetGauge';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { AlertBanner } from '../components/AlertBanner';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { Icon } from '../components/Icon';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [budget, setBudget] = useState<BudgetSettings>({
    needs_percentage: 50,
    wants_percentage: 30,
    savings_percentage: 20,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [p, b, txs] = await Promise.all([
        getProfile(user.id),
        getBudgetSettings(user.id),
        getTransactions(user.id),
      ]);

      if (p) {
        setProfile(p);
      } else {
        // Fallback default demo profile
        setProfile({
          id: user.id,
          name: user.name || 'Pengguna FATrack',
          monthly_salary: 5500000,
          payday_date: 25,
          fixed_expenses: 1200000,
        });
      }

      setBudget(b);
      setTransactions(txs);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user]);

  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (loading || !profile) return;
    const ctx = gsap.context(() => {
      // Header and KPI stagger
      gsap.from('.dashboard-hero-strip > *', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
      gsap.from('.kpi-cell', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        delay: 0.1,
        ease: 'power2.out',
      });

      // Left column cards stagger
      gsap.from('.dashboard-left-col > *', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.2,
        ease: 'power3.out',
      });

      // Right column cards stagger
      gsap.from('.dashboard-right-col > *', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.25,
        ease: 'power3.out',
      });

      // Progress bar fill growth
      gsap.fromTo(
        '.progress-fill',
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 1, delay: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.gauge-fill',
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 1, delay: 0.4, ease: 'power2.out' }
      );
    }, rootRef);

    return () => ctx.revert();
  }, [loading, profile]);

  // Derived financial metrics
  const salary = profile?.monthly_salary || 0;
  const fixedExpenses = profile?.fixed_expenses || 0;
  const paydayDate = profile?.payday_date || 25;

  const allocation = useMemo(() => {
    return calculateAllocationWithPayday(
      salary,
      fixedExpenses,
      {
        needs: budget.needs_percentage,
        wants: budget.wants_percentage,
        savings: budget.savings_percentage,
      },
      paydayDate
    );
  }, [salary, fixedExpenses, budget, paydayDate]);

  const daysInCycle = allocation.daysInCycle;
  const currentDayIndex = getDayInCycle(paydayDate);
  const daysRemaining = Math.max(1, daysInCycle - currentDayIndex + 1);

  // Spending aggregations
  const todayStr = new Date().toISOString().slice(0, 10);

  const spentToday = useMemo(() => {
    return transactions
      .filter((t) => t.transaction_date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayStr]);

  const categorySpending = useMemo(() => {
    return aggregateByCategory(transactions);
  }, [transactions]);

  const actualNeeds = categorySpending['Needs'] || 0;
  const actualWants = categorySpending['Wants'] || 0;
  const actualSavings = categorySpending['Savings'] || 0;
  const totalSpent = actualNeeds + actualWants + actualSavings;

  // Alerts & Checks
  const isOverWants = allocation.wantsAmount > 0 && actualWants > allocation.wantsAmount;
  const isOverDaily = allocation.dailyLimit > 0 && spentToday > allocation.dailyLimit;

  // Financial Health Score
  const healthScore = useMemo(() => {
    return calculateFinancialHealthScore({
      totalSpent,
      needsSpent: actualNeeds,
      wantsSpent: actualWants,
      savingsActual: actualSavings,
      targetNeeds: allocation.needsAmount,
      targetWants: allocation.wantsAmount,
      targetSavings: allocation.savingsAmount,
    });
  }, [totalSpent, actualNeeds, actualWants, actualSavings, allocation]);

  const savingsRatio = totalSpent > 0 ? (actualSavings / totalSpent) * 100 : 0;
  const wantsRatio = totalSpent > 0 ? (actualWants / totalSpent) * 100 : 0;

  // Transaction handlers
  const handleAddTransaction = async (txData: {
    title: string;
    amount: number;
    category: 'Needs' | 'Wants' | 'Savings';
    transaction_date: string;
  }) => {
    if (!user) return;
    const newTx = await addTransaction(user.id, txData);
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteTransaction(user.id, id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading && !profile) {
    return (
      <div className="dashboard-loading-state">
        <div className="status-modal__spinner" />
        <small>MEMUAT TELEMETRI KEUANGAN...</small>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="dashboard-page-container">
      {/* FREE TIER NOTICE BANNER */}
      {!isPremium && (
        <div className="free-tier-notice">
          <div className="free-tier-notice__content">
            <span className="free-tier-notice__dot"></span>
            <div>
              <span className="free-tier-notice__label">
                MODE MONEY TRACKER AKTIF
              </span>
              <span className="free-tier-notice__desc">
                Aplikasi berjalan dalam mode pencatat pengeluaran. Buka kalkulator Safe-to-Spend adaptif, analisis 50/30/20, dan rekomendasi sewa kost dengan upgrade.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/subscription')}
            className="pill dark"
          >
            <span className="inline-flex items-center gap-1.5">Upgrade ke Advisor (Rp 29.900) <Icon name="arrowRight" size={13} /></span>
          </button>
        </div>
      )}

      {/* DASHBOARD HERO HEADER */}
      <section className="dashboard-hero-strip">
        <div className="strip-title-box">
          <small className="accent">TELEMETRI KEUANGAN & ANGGARAN</small>
          <h2>IKHTISAR KEUANGAN SIKLUS</h2>
          <p>
            Gaji Bersih: <b>{formatRupiah(salary)}</b> · Biaya Tetap: <b>{formatRupiah(fixedExpenses)}</b> · Siklus: <b>Tgl {paydayDate}</b>
          </p>
        </div>

        <div className="strip-actions">
          <button
            type="button"
            className="tag-btn"
            onClick={() => navigate('/onboarding')}
          >
            <Icon name="settings" size={14} /> EDIT PROFIL & GAJI
          </button>
          <button
            type="button"
            className="tag-btn active"
            onClick={() => navigate('/alokasi')}
          >
            <Icon name="swap" size={14} /> ALOKASI 50/30/20 {!isPremium && <small className="nav-lock-tag"><Icon name="lock" size={11} /> PRO</small>}
          </button>
          <button
            type="button"
            className="tag-btn"
            onClick={() => navigate('/rekomendasi')}
          >
            <Icon name="star" size={14} /> REKOMENDASI GAYA HIDUP {!isPremium && <small className="nav-lock-tag"><Icon name="lock" size={11} /> PRO</small>} <Icon name="arrowRight" size={14} />
          </button>
          {!isPremium && (
            <button
              type="button"
              className="tag-btn tag-btn--upgrade"
              onClick={() => navigate('/subscription')}
            >
              <Icon name="star" size={14} /> UPGRADE ADVISOR
            </button>
          )}
        </div>
      </section>

      {/* SYSTEM ALERTS */}
      <AlertBanner
        isOverWants={isOverWants}
        wantsSpent={actualWants}
        targetWants={allocation.wantsAmount}
        isOverDaily={isOverDaily}
        dailySpent={spentToday}
        dailyLimit={allocation.dailyLimit}
      />

      {/* TOP KPI METRICS STRIP */}
      <section className="dashboard-kpi-grid">
        <div className="kpi-cell">
          <small>BATAS JAJAN HARIAN {!isPremium && <span style={{ color: '#d97706' }}>[ADVISOR]</span>}</small>
          <strong>{formatRupiah(allocation.dailyLimit)}</strong>
          <span>Safe-to-Spend / hari</span>
        </div>
        <div className="kpi-cell">
          <small>PENGELUARAN HARI INI</small>
          <strong className={isOverDaily ? 'red-text' : 'green-text'}>
            {formatRupiah(spentToday)}
          </strong>
          <span>Sisa Hari Ini: {formatRupiah(Math.max(0, allocation.dailyLimit - spentToday))}</span>
        </div>
        <div className="kpi-cell">
          <small>TOTAL DISPOSABLE BULANAN</small>
          <strong>{formatRupiah(allocation.disposableIncome)}</strong>
          <span>Setelah Biaya Tetap & Tabungan</span>
        </div>
        <div className="kpi-cell">
          <small>SKOR KESEHATAN KEUANGAN {!isPremium && <span style={{ color: '#d97706' }}>[ADVISOR]</span>}</small>
          <strong className={healthScore >= 70 ? 'green-text' : healthScore >= 50 ? 'accent' : 'red-text'}>
            {healthScore} / 100
          </strong>
          <span>{healthScore >= 70 ? 'STATUS PRIMA' : 'PERLU PERHATIAN'}</span>
        </div>
      </section>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <section className="dashboard-columns-grid">
        {/* LEFT COLUMN: DAILY LIMIT + GAUGES + HEALTH SCORE */}
        <div className="dashboard-left-col">
          <DailyLimitCard
            dailyLimit={allocation.dailyLimit}
            spentToday={spentToday}
            daysRemaining={daysRemaining}
            paydayDate={paydayDate}
            disposableMonthly={allocation.disposableIncome}
          />

          <BudgetGauge
            monthlyBudget={allocation.disposableIncome}
            monthlySpent={totalSpent}
            dailyLimit={allocation.dailyLimit}
            dailySpent={spentToday}
          />

          <HealthScoreCard
            score={healthScore}
            savingsRatio={savingsRatio}
            wantsRatio={wantsRatio}
            isOverWants={isOverWants}
          />
        </div>

        {/* RIGHT COLUMN: CHART + QUICK TRANSACTION + RECENT */}
        <div className="dashboard-right-col">
          <AllocationChart
            targetNeeds={allocation.needsAmount}
            targetWants={allocation.wantsAmount}
            targetSavings={allocation.savingsAmount}
            actualNeeds={actualNeeds}
            actualWants={actualWants}
            actualSavings={actualSavings}
          />

          <div className="quick-add-transaction-box">
            <TransactionForm onAddTransaction={handleAddTransaction} />
          </div>

          <div className="recent-transactions-box">
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
