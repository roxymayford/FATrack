import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import {
  Transaction,
  getTransactions,
  addTransaction,
  deleteTransaction,
  aggregateByCategory,
} from '../lib/storage';
import { formatRupiah } from '../lib/calculator';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.transactions-form-col', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
      });
      gsap.from('.transactions-list-col', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        delay: 0.1,
        ease: 'power2.out',
      });
      gsap.from('.tally-item', {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }, rootRef);

    return () => ctx.revert();
  }, [loading]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const txs = await getTransactions(user.id);
      setTransactions(txs);
    } catch (err) {
      console.error('Error loading transactions:', err);
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

  const catAgg = useMemo(() => {
    return aggregateByCategory(transactions);
  }, [transactions]);

  const totalSpent = (catAgg['Needs'] || 0) + (catAgg['Wants'] || 0) + (catAgg['Savings'] || 0);

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <div className="status-modal__spinner" />
        <small>MEMUAT BUKU KAS TRANSAKSI...</small>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="transactions-page-container">
      <div className="page-head-strip">
        <div>
          <small className="accent">MODUL 04 / PENCATATAN KAS HARIAN</small>
          <h2>BUKU BESAR TRANSAKSI (LEDGER)</h2>
          <p>
            Catat setiap pengeluaran secara manual dengan kategorisasi statis (Needs, Wants, Savings).
            Data tersimpan aman di database Supabase terisolasi per akun pengguna.
          </p>
        </div>

        <div className="transactions-kpi-strip">
          <div>
            <small>TOTAL TRANSAKSI</small>
            <b>{transactions.length} Entri</b>
          </div>
          <div>
            <small>TOTAL KAS KELUAR</small>
            <strong className="accent">{formatRupiah(totalSpent)}</strong>
          </div>
        </div>
      </div>

      <div className="category-tally-bar">
        <div className="tally-item">
          <span>NEEDS (POKOK):</span>
          <b>{formatRupiah(catAgg['Needs'] || 0)}</b>
        </div>
        <div className="tally-item">
          <span>WANTS (LIFESTYLE):</span>
          <b className="accent">{formatRupiah(catAgg['Wants'] || 0)}</b>
        </div>
        <div className="tally-item">
          <span>SAVINGS (TABUNGAN):</span>
          <b className="green-text">{formatRupiah(catAgg['Savings'] || 0)}</b>
        </div>
      </div>

      <div className="transactions-content-layout">
        <div className="transactions-form-col">
          <TransactionForm onAddTransaction={handleAddTransaction} />
        </div>

        <div className="transactions-list-col">
          <TransactionList
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      </div>
    </div>
  );
};
