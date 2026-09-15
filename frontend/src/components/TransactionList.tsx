import React, { useState, useMemo } from 'react';
import { Transaction } from '../lib/storage';
import { formatRupiah } from '../lib/calculator';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => Promise<void> | void;
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }
  return dateStr;
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Needs' | 'Wants' | 'Savings'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      const matchQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [transactions, categoryFilter, searchQuery]);

  const totalVisible = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filtered]);

  return (
    <section className="transaction-ledger-section">
      <div className="ledger-controls-bar">
        <div className="controls-left">
          <small className="accent">BUKU KAS UMUM / FILTER</small>
          <h4>RIWAYAT TRANSAKSI</h4>
        </div>

        <div className="controls-right">
          <input
            type="text"
            className="search-input"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="category-filter-pills">
            {(['All', 'Needs', 'Wants', 'Savings'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'All' ? 'SEMUA' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ledger-summary-strip">
        <span>Menampilkan: <b>{filtered.length} Transaksi</b></span>
        <span>Subtotal Kas Keluar: <b>{formatRupiah(totalVisible)}</b></span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-ledger-box">
          <p>Belum ada catatan transaksi untuk kriteria filter ini.</p>
          <small>Gunakan formulir di atas untuk mencatat pengeluaran Anda.</small>
        </div>
      ) : (
        <div className="ledger-table-container">
          <table className="swiss-ledger-table">
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>KETERANGAN</th>
                <th>KATEGORI</th>
                <th style={{ textAlign: 'right' }}>NOMINAL</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="ledger-table-row">
                  <td className="tx-date-cell">{formatDisplayDate(tx.transaction_date)}</td>
                  <td className="tx-title-cell">
                    <b>{tx.title}</b>
                  </td>
                  <td className="tx-cat-cell">
                    <span className={`cat-tag cat-${tx.category.toLowerCase()}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="tx-amount-cell" style={{ textAlign: 'right' }}>
                    <strong>{formatRupiah(tx.amount)}</strong>
                  </td>
                  <td className="tx-action-cell" style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="tx-delete-btn"
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Hapus transaksi"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
