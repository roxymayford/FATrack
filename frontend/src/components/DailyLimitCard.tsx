import React from 'react';
import { formatRupiah } from '../lib/calculator';

interface DailyLimitCardProps {
  dailyLimit: number;
  spentToday: number;
  daysRemaining: number;
  paydayDate: number;
  disposableMonthly: number;
}

export const DailyLimitCard: React.FC<DailyLimitCardProps> = ({
  dailyLimit,
  spentToday,
  daysRemaining,
  paydayDate,
  disposableMonthly,
}) => {
  const remainingToday = Math.max(0, dailyLimit - spentToday);
  const percentSpentToday = dailyLimit > 0 ? Math.min(100, (spentToday / dailyLimit) * 100) : 0;
  const isOverLimit = spentToday > dailyLimit;

  let statusClass = 'green';
  let statusText = 'AMAN / DALAM BATAS';

  if (isOverLimit) {
    statusClass = 'red';
    statusText = 'OVER-BUDGET HARIAN';
  } else if (percentSpentToday > 75) {
    statusClass = 'orange';
    statusText = 'MENDEKATI LIMIT';
  }

  return (
    <div className="daily-limit-widget terminal-card">
      <div className="widget-top">
        <div>
          <small className="accent">ALGORITMA DISIPLIN / SAFE-TO-SPEND</small>
          <h4>BATAS JAJAN HARIAN</h4>
        </div>
        <span className={`status-pill ${statusClass}`}>{statusText}</span>
      </div>

      <div className="daily-amount-display">
        <span className="unit-label">BATAS MAKSIMAL HARI INI</span>
        <strong className="limit-amount">{formatRupiah(dailyLimit)}</strong>
        <span className="formula-hint">
          (Gaji Netto − Fixed Exp − Tabungan) ÷ Hari dalam Siklus
        </span>
      </div>

      <div className="daily-progress-section">
        <div className="progress-labels">
          <span>Terpakai Hari Ini: <b>{formatRupiah(spentToday)}</b></span>
          <span>Sisa: <b className={isOverLimit ? 'red-text' : 'green-text'}>{formatRupiah(remainingToday)}</b></span>
        </div>
        <div className="swiss-progress-bar">
          <div
            className={`progress-fill ${statusClass}-fill`}
            style={{ width: `${percentSpentToday}%` }}
          />
        </div>
      </div>

      <div className="cycle-metadata-grid">
        <div>
          <small>SIKLUS GAJIAN</small>
          <b>TGL {paydayDate} TIAP BULAN</b>
        </div>
        <div>
          <small>SISA HARI SIKLUS</small>
          <b className="accent">{daysRemaining} HARI LAGI</b>
        </div>
        <div>
          <small>TOTAL DISPOSABLE</small>
          <b>{formatRupiah(disposableMonthly)}/BLN</b>
        </div>
      </div>
    </div>
  );
};
