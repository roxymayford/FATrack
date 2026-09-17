import React from 'react';
import { KostTier } from '../data/recommendations';
import { formatRupiah } from '../lib/calculator';
import { Icon } from './Icon';

interface KostCardProps {
  tier: KostTier;
  isRecommended: boolean;
  userSalary: number;
}

export const KostCard: React.FC<KostCardProps> = ({ tier, isRecommended, userSalary }) => {
  const maxSafeRent = userSalary * 0.25;

  return (
    <article className={`kost-card ${isRecommended ? 'kost-card-recommended' : ''}`}>
      {isRecommended && (
        <div className="recommendation-badge">
          <Icon name="star" size={14} /> REKOMENDASI SESUAI GAJI ANDA
        </div>
      )}

      <div className="kost-card-head">
        <div>
          <small className="accent">KATEGORI HUNIAN</small>
          <h3>{tier.tierName.toUpperCase()}</h3>
        </div>
        <span className="price-tag">
          {formatRupiah(tier.estimatedPrice.min)} – {formatRupiah(tier.estimatedPrice.max)}
          <small>/ bln</small>
        </span>
      </div>

      <p className="kost-desc">{tier.description}</p>

      <div className="kost-facilities-block">
        <small>FASILITAS UMUM & KAMAR:</small>
        <div className="facilities-tags">
          {tier.facilities.map((fac) => (
            <span key={fac} className="facility-tag">
              <Icon name="check" size={14} /> {fac}
            </span>
          ))}
        </div>
      </div>

      <div className="kost-card-foot">
        <div>
          <small>STANDAR ALOKASI GAJI</small>
          <b>20% – 25% (Maks: {formatRupiah(maxSafeRent)}/bln)</b>
        </div>
        <span className="salary-bracket">
          Gaji: {tier.minSalary > 0 ? formatRupiah(tier.minSalary) : '< Rp 3 Jt'}
          {tier.maxSalary < Infinity ? ` – ${formatRupiah(tier.maxSalary)}` : '+'}
        </span>
      </div>
    </article>
  );
};
