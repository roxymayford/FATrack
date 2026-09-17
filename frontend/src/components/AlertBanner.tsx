import React from 'react';
import { Icon } from './Icon';
import { formatRupiah } from '../lib/calculator';

interface AlertBannerProps {
  isOverWants: boolean;
  wantsSpent: number;
  targetWants: number;
  isOverDaily: boolean;
  dailySpent: number;
  dailyLimit: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  isOverWants,
  wantsSpent,
  targetWants,
  isOverDaily,
  dailySpent,
  dailyLimit,
}) => {
  if (!isOverWants && !isOverDaily) {
    return null;
  }

  const wantsExcess = wantsSpent - targetWants;
  const dailyExcess = dailySpent - dailyLimit;

  return (
    <div className="alert-banner-stack">
      {isOverWants && (
        <div className="swiss-alert alert-wants-exceeded">
          <div className="alert-icon"><Icon name="alert" size={20} /></div>
          <div className="alert-content">
            <b>PERINGATAN ANGGARAN: ALOKASI WANTS MELAMPAUI TARGET</b>
            <p>
              Pengeluaran kategori <strong>Wants (Gaya Hidup)</strong> telah mencapai{' '}
              {formatRupiah(wantsSpent)}, melebihi alokasi target sebesar{' '}
              <span className="bold-excess">+{formatRupiah(wantsExcess)}</span>. Segera evaluasi
              pengeluaran diskresioner untuk menjaga likuiditas bulanan Anda.
            </p>
          </div>
          <span className="alert-tag">OVERSPEND LIFESTYLE</span>
        </div>
      )}

      {isOverDaily && (
        <div className="swiss-alert alert-daily-exceeded">
          <div className="alert-icon"><Icon name="bolt" size={20} /></div>
          <div className="alert-content">
            <b>PERINGATAN LIMIT HARIAN: BATAS JAJAN HARI INI TERLAMPAUI</b>
            <p>
              Realisasi transaksi hari ini ({formatRupiah(dailySpent)}) melampaui Safe-to-Spend limit
              sebesar <span className="bold-excess">+{formatRupiah(dailyExcess)}</span>. Kurangi budget
              jajan besok untuk mempertahankan target saldo akhir bulan.
            </p>
          </div>
          <span className="alert-tag">DAILY CEILING BREACH</span>
        </div>
      )}
    </div>
  );
};
