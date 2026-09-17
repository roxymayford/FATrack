import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { CurrencyInput } from '../components/CurrencyInput';
import { getProfile, upsertProfile } from '../lib/storage';
import { formatRupiah } from '../lib/calculator';

interface FixedExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [salary, setSalary] = useState<number>(5500000);
  const [paydayDate, setPaydayDate] = useState<number>(25);
  const [expenseItems, setExpenseItems] = useState<FixedExpenseItem[]>([
    { id: '1', name: 'Cicilan / Utang', amount: 500000 },
    { id: '2', name: 'Iuran BPJS / Asuransi', amount: 150000 },
    { id: '3', name: 'Bantuan Keluarga / Kiriman Ortu', amount: 500000 },
    { id: '4', name: 'Tagihan Listrik & WiFi', amount: 350000 },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load existing profile if available
    getProfile(user.id).then((profile) => {
      if (profile && profile.monthly_salary > 0) {
        setSalary(profile.monthly_salary);
        setPaydayDate(profile.payday_date || 25);
      }
    });
  }, [user, navigate]);

  const totalFixedExpenses = expenseItems.reduce((acc, curr) => acc + curr.amount, 0);
  const disposablePool = Math.max(0, salary - totalFixedExpenses);
  // Simulation: 20% savings target
  const simulatedSavings = disposablePool * 0.2;
  const simulatedDailyLimit = Math.max(0, (disposablePool - simulatedSavings) / 30);

  const addExpenseItem = () => {
    if (!newItemName.trim() || newItemAmount <= 0) return;
    setExpenseItems([
      ...expenseItems,
      { id: Date.now().toString(), name: newItemName.trim(), amount: newItemAmount },
    ]);
    setNewItemName('');
    setNewItemAmount(0);
  };

  const removeExpenseItem = (id: string) => {
    setExpenseItems(expenseItems.filter((item) => item.id !== id));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (salary <= 0) return;

    setIsSaving(true);
    try {
      await upsertProfile({
        id: user.id,
        name: user.name || 'Pengguna FATrack',
        monthly_salary: salary,
        payday_date: paydayDate,
        fixed_expenses: totalFixedExpenses,
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="onboarding-page-wrap">
      <header className="onboarding-header">
        <div className="brand">
          <span className="avatar">FA</span>
          <b>FATRACK</b>
          <i>/</i>
          <span>SETUP PROFIL KEUANGAN</span>
        </div>
        <button type="button" className="nav-link" onClick={() => navigate('/dashboard')}>
          <span className="inline-flex items-center gap-1.5">LEWATI KE DASHBOARD <Icon name="arrowRight" size={14} /></span>
        </button>
      </header>

      <main className="onboarding-container">
        <div className="onboarding-intro">
          <small className="accent">LANGKAH 01 / ENGINE SETUP</small>
          <h1>STRUKTURKAN ARUS KAS ANDA.</h1>
          <p>
            Masukkan pemasukan netto, siklus gajian, dan komitmen pengeluaran tetap bulanan.
            Sistem akan menghitung kapasitas likuiditas dan batas pengeluaran harian Anda.
          </p>
        </div>

        <form className="onboarding-grid" onSubmit={handleSaveProfile}>
          {/* LEFT: FORM INPUTS */}
          <div className="onboarding-inputs-column">
            {/* 1. GAJI */}
            <div className="setup-card">
              <small className="accent">01 / PEMASUKAN BULANAN (NET INCOME)</small>
              <h3>BERAPA TOTAL GAJI BERSIH ANDA?</h3>
              <p>Gaji netto bulanan yang masuk ke rekening utama Anda.</p>

              <CurrencyInput
                value={salary}
                onChange={setSalary}
                placeholder="Contoh: 5.500.000"
                required
              />

              <div className="quick-salary-presets">
                <span>Rekomendasi preset:</span>
                {[3000000, 5000000, 7500000, 10000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`preset-btn ${salary === val ? 'active' : ''}`}
                    onClick={() => setSalary(val)}
                  >
                    {formatRupiah(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. SIKLUS GAJIAN */}
            <div className="setup-card">
              <small className="accent">02 / SIKLUS GAJIAN (PAYDAY CYCLE)</small>
              <h3>KAPAN TANGGAL GAJIAN ANDA?</h3>
              <p>Tanggal setiap bulan di mana siklus anggaran baru di-reset.</p>

              <div className="payday-selector-wrap">
                <label>
                  TANGGAL GAJIAN SETIAP BULAN:
                  <select
                    value={paydayDate}
                    onChange={(e) => setPaydayDate(Number(e.target.value))}
                    className="payday-dropdown"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Tanggal {day} (Tiap Bulan)
                      </option>
                    ))}
                  </select>
                </label>
                <small className="muted-text">
                  Sebagian besar perusahaan menggaji antara tanggal 25 s/d 28.
                </small>
              </div>
            </div>

            {/* 3. FIXED EXPENSES */}
            <div className="setup-card">
              <div className="flex-between">
                <div>
                  <small className="accent">03 / PENGELUARAN TETAP (FIXED EXPENSES)</small>
                  <h3>KOMITMEN PENGELUARAN WAJIB</h3>
                </div>
                <strong className="accent-total">{formatRupiah(totalFixedExpenses)}</strong>
              </div>
              <p>
                Cicilan, BPJS, kiriman orang tua, internet, dan kewajiban lain yang harus dibayar setiap bulan (di luar sewa kost dan jajan).
              </p>

              <div className="expense-items-list">
                {expenseItems.map((item) => (
                  <div key={item.id} className="expense-item-row">
                    <div>
                      <b>{item.name}</b>
                    </div>
                    <div className="item-row-right">
                      <strong>{formatRupiah(item.amount)}</strong>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => removeExpenseItem(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ADD NEW FIXED EXPENSE */}
              <div className="add-expense-bar">
                <input
                  type="text"
                  placeholder="Nama pengeluaran (misal: Langganan Spotify)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <CurrencyInput
                  value={newItemAmount}
                  onChange={setNewItemAmount}
                  placeholder="Nominal"
                />
                <button type="button" className="tag-btn active" onClick={addExpenseItem}>
                  + TAMBAH
                </button>
              </div>
            </div>

            <button type="submit" className="pill dark submit-setup-btn" disabled={isSaving}>
              {isSaving ? 'MENYIMPAN STRUKTUR...' : <span className="inline-flex items-center gap-1.5">SIMPAN & AKTIFKAN DASHBOARD <Icon name="arrowRight" size={14} /></span>}
            </button>
          </div>

          {/* RIGHT: LIVE CALCULATION TELEMETRY PREVIEW */}
          <aside className="onboarding-preview-column terminal">
            <div className="terminal-head">
              <span className="terminal-pulse">■</span> TELEMETRI PREVIEW ARUS KAS
              <span>LIVE ALKORITMA</span>
            </div>

            <div className="terminal-body">
              <div className="worth terminal-card">
                <span className="terminal-scan" />
                <small>ESTIMASI BATAS JAJAN HARIAN (SAFE-TO-SPEND)</small>
                <strong>{formatRupiah(simulatedDailyLimit)} <small>/ hari</small></strong>
                <span>FORMULA: (GAJI NETTO − FIXED EXP − 20% TABUNGAN) ÷ 30 HARI</span>
              </div>

              <div className="twins terminal-card">
                <div>
                  <small>GAJI BERSIH</small>
                  <b>{formatRupiah(salary)}</b>
                  <span>Siklus Tgl {paydayDate}</span>
                </div>
                <div>
                  <small>TOTAL BIAYA TETAP</small>
                  <b className="red-text">{formatRupiah(totalFixedExpenses)}</b>
                  <span>{salary > 0 ? ((totalFixedExpenses / salary) * 100).toFixed(1) : 0}% Gaji</span>
                </div>
              </div>

              <div className="allocation terminal-card">
                <small>SISA DANA BEBAS (DISPOSABLE POOL)</small>
                <div style={{ margin: '10px 0' }}>
                  <strong style={{ fontSize: '24px' }}>{formatRupiah(disposablePool)}</strong>
                </div>
                <span>
                  Target Tabungan 20% <b>{formatRupiah(simulatedSavings)}</b>
                  <i><em style={{ width: '20%', backgroundColor: '#008547' }} /></i>
                </span>
                <span>
                  Alokasi Kost Maksimal (25% Gaji) <b>{formatRupiah(salary * 0.25)}</b>
                  <i><em style={{ width: '25%', backgroundColor: 'var(--orange)' }} /></i>
                </span>
              </div>
            </div>

            <div className="terminal-foot">
              STRUKTUR DATA TERSINKRONISASI <b>STATUS: READY</b>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
};
