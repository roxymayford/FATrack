import { FormEvent, useMemo, useState } from 'react';

export type Transaction = {
  id: number;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
};

const initialTransactions: Transaction[] = [];

type DashboardProps = {
  onLogout: () => void;
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kontor-transactions') || '[]');
    } catch {
      return initialTransactions;
    }
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: 'Umum',
    type: 'expense' as Transaction['type'],
    amount: '',
  });

  const [filter, setFilter] = useState('all');

  const visible = useMemo(
    () => (filter === 'all' ? transactions : transactions.filter((item) => item.type === filter)),
    [filter, transactions]
  );

  function addTransaction(event: FormEvent) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0) return;

    const next = [{ ...form, id: Date.now(), amount }, ...transactions];
    setTransactions(next);
    localStorage.setItem('kontor-transactions', JSON.stringify(next));
    setForm({ ...form, description: '', amount: '' });
  }

  function removeTransaction(id: number) {
    const next = transactions.filter((item) => item.id !== id);
    setTransactions(next);
    localStorage.setItem('kontor-transactions', JSON.stringify(next));
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <button className="auth-brand" type="button" onClick={onLogout}>
          <span className="avatar">K</span>
          <b>KONTOR</b>
          <i>/</i>
          <span>CAPITAL TRACKER</span>
        </button>
        <div>
          <small>LEDGER MANUAL / LOKAL</small>
          <button className="nav-link dashboard-logout" type="button" onClick={onLogout}>
            KELUAR
          </button>
        </div>
      </header>

      <section className="dashboard-intro">
        <small className="accent">DASHBOARD / MONEY TRACKER</small>
        <h1>
          CATAT UANG
          <br />
          SECARA MANUAL.
        </h1>
        <p>Tambahkan pemasukan dan pengeluaran satu per satu. Data tersimpan di perangkat ini.</p>
      </section>

      <section className="tracker-layout">
        <form className="tracker-form" onSubmit={addTransaction}>
          <small>INPUT TRANSAKSI BARU</small>

          <label>
            TANGGAL
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>

          <label>
            KETERANGAN
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Contoh: Belanja bulanan"
              required
            />
          </label>

          <label>
            KATEGORI
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Contoh: Makanan"
            />
          </label>

          <label>
            JENIS
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Transaction['type'] })}
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </label>

          <label>
            NOMINAL (RP)
            <input
              inputMode="numeric"
              type="number"
              min="1"
              step="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <button className="pill dark" type="submit">
            SIMPAN TRANSAKSI
          </button>
        </form>

        <section className="ledger">
          <div className="ledger-head">
            <div>
              <small>RIWAYAT TRANSAKSI</small>
              <h2>LEDGER</h2>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter transaksi"
            >
              <option value="all">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          {visible.length === 0 ? (
            <p className="empty-ledger">
              Belum ada transaksi. Gunakan formulir untuk mulai mencatat.
            </p>
          ) : (
            <div className="ledger-list">
              {visible.map((item) => (
                <article className="ledger-row" key={item.id}>
                  <div>
                    <b>{item.description}</b>
                    <small>
                      {item.date} · {item.category}
                    </small>
                  </div>
                  <strong className={item.type === 'income' ? 'income' : 'expense'}>
                    {item.type === 'income' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                    <button
                      type="button"
                      onClick={() => removeTransaction(item.id)}
                      aria-label={`Hapus ${item.description}`}
                    >
                      ×
                    </button>
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
