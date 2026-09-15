import React from 'react';

interface HealthScoreCardProps {
  score: number;
  savingsRatio: number;
  wantsRatio: number;
  isOverWants: boolean;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  score,
  savingsRatio,
  wantsRatio,
  isOverWants,
}) => {
  let grade = 'A';
  let status = 'PRIMA & DISIPLIN';
  let colorClass = 'green';
  let advice = 'Alokasi keuangan Anda berada dalam performa ideal. Pertahankan rasio tabungan dan investasi saat ini.';

  if (score < 40) {
    grade = 'D';
    status = 'KRITIS / PERLU PEMULIHAN';
    colorClass = 'red';
    advice = 'Pengeluaran gaya hidup (Wants) melampaui batas aman. Segera rem transaksi sekunder dan amankan dana darurat.';
  } else if (score < 65) {
    grade = 'C';
    status = 'WASPADA / DEVIASI RINGAN';
    colorClass = 'orange';
    advice = 'Rasio tabungan belum menyentuh target minimal 20%. Kurangi pengeluaran impulsif harian.';
  } else if (score < 85) {
    grade = 'B';
    status = 'STABIL & CUKUP SEHAT';
    colorClass = 'green';
    advice = 'Arus kas terkendali dengan baik. Coba tingkatkan alokasi tabungan untuk mempercepat dana darurat.';
  }

  return (
    <div className="health-score-widget terminal-card">
      <div className="health-top">
        <small className="accent">ALGORITMA DIAGNOSIS / FATRACK SCORE</small>
        <span className={`status-pill ${colorClass}`}>{status}</span>
      </div>

      <div className="score-main-display">
        <div className="score-number-box">
          <span className="grade-badge">{grade}</span>
          <div className="score-val-wrap">
            <strong className="score-number">{score}</strong>
            <span className="score-max">/ 100</span>
          </div>
        </div>

        <div className="health-breakdown-metrics">
          <div className="metric-cell">
            <small>RASIO TABUNGAN</small>
            <b className={savingsRatio >= 20 ? 'green-text' : 'orange-text'}>
              {savingsRatio.toFixed(1)}%
            </b>
            <span>Min: 20%</span>
          </div>
          <div className="metric-cell">
            <small>KONTROL WANTS</small>
            <b className={isOverWants ? 'red-text' : 'green-text'}>
              {wantsRatio.toFixed(1)}%
            </b>
            <span>Maks: 30-40%</span>
          </div>
          <div className="metric-cell">
            <small>STATUS RISIKO</small>
            <b>{score >= 70 ? 'RENDAH' : score >= 50 ? 'MODERAT' : 'TINGGI'}</b>
            <span>Volatilitas Kas</span>
          </div>
        </div>
      </div>

      <div className="health-advice-box">
        <b>REKOMENDASI SISTEM:</b>
        <p>{advice}</p>
      </div>
    </div>
  );
};
