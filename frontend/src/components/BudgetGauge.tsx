import React from 'react';
import { formatRupiah } from '../lib/calculator';

interface BudgetGaugeProps {
  monthlyBudget: number;
  monthlySpent: number;
  dailyLimit: number;
  dailySpent: number;
}

export const BudgetGauge: React.FC<BudgetGaugeProps> = ({
  monthlyBudget,
  monthlySpent,
  dailyLimit,
  dailySpent,
}) => {
  const monthlyPercent = monthlyBudget > 0 ? Math.min(100, (monthlySpent / monthlyBudget) * 100) : 0;
  const monthlyRemaining = Math.max(0, monthlyBudget - monthlySpent);
  const isMonthlyExceeded = monthlySpent > monthlyBudget;

  const dailyPercent = dailyLimit > 0 ? Math.min(100, (dailySpent / dailyLimit) * 100) : 0;
  const dailyRemaining = Math.max(0, dailyLimit - dailySpent);
  const isDailyExceeded = dailySpent > dailyLimit;

  return (
    <div className="budget-gauge-box">
      <div className="gauge-item">
        <div className="gauge-item-header">
          <div>
            <small className="accent">GAUGE HARIAN</small>
            <b>PENGELUARAN HARI INI</b>
          </div>
          <strong>{dailyPercent.toFixed(0)}%</strong>
        </div>
        <div className="swiss-gauge-bar">
          <div
            className={`gauge-fill ${isDailyExceeded ? 'gauge-red' : dailyPercent > 80 ? 'gauge-orange' : 'gauge-black'}`}
            style={{ width: `${dailyPercent}%` }}
          />
        </div>
        <div className="gauge-meta">
          <span>Terpakai: {formatRupiah(dailySpent)}</span>
          <span>Sisa: <b className={isDailyExceeded ? 'red-text' : 'green-text'}>{formatRupiah(dailyRemaining)}</b></span>
        </div>
      </div>

      <div className="gauge-item">
        <div className="gauge-item-header">
          <div>
            <small className="accent">GAUGE BULANAN</small>
            <b>TOTAL REALISASI SIKLUS</b>
          </div>
          <strong>{monthlyPercent.toFixed(0)}%</strong>
        </div>
        <div className="swiss-gauge-bar">
          <div
            className={`gauge-fill ${isMonthlyExceeded ? 'gauge-red' : monthlyPercent > 85 ? 'gauge-orange' : 'gauge-black'}`}
            style={{ width: `${monthlyPercent}%` }}
          />
        </div>
        <div className="gauge-meta">
          <span>Terpakai: {formatRupiah(monthlySpent)}</span>
          <span>Sisa Budget: <b className={isMonthlyExceeded ? 'red-text' : 'green-text'}>{formatRupiah(monthlyRemaining)}</b></span>
        </div>
      </div>
    </div>
  );
};
