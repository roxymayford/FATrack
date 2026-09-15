import React, { useState } from 'react';
import { mealPlans, groceryBaskets } from '../data/recommendations';
import { formatRupiah } from '../lib/calculator';

interface MealPlanCardProps {
  userNeedsAmount: number;
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({ userNeedsAmount }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'groceries'>('plans');
  const [selectedTier, setSelectedTier] = useState<'low' | 'medium' | 'high'>('medium');

  const activeBasket = groceryBaskets.find((g) => g.budgetTier === selectedTier) || groceryBaskets[0];

  return (
    <div className="lifestyle-meal-section">
      <div className="meal-section-nav">
        <div>
          <small className="accent">SIMULASI GAYA HIDUP PANGAN</small>
          <h3>ESTIMASI KEBUTUHAN MAKAN & GROCERIES</h3>
        </div>
        <div className="tab-pill-group">
          <button
            type="button"
            className={`pill-btn ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            01 / MASAK VS WARTEG
          </button>
          <button
            type="button"
            className={`pill-btn ${activeTab === 'groceries' ? 'active' : ''}`}
            onClick={() => setActiveTab('groceries')}
          >
            02 / PAKET MINIMARKET
          </button>
        </div>
      </div>

      {activeTab === 'plans' ? (
        <div className="meal-plans-grid">
          {mealPlans.map((plan) => (
            <div key={plan.id} className="meal-plan-card">
              <div className="plan-header">
                <small className="accent">STRATEGI KONSUMSI</small>
                <h4>{plan.title.toUpperCase()}</h4>
                <div className="plan-pricing">
                  <strong>{formatRupiah(plan.estimatedCostPerDay)}</strong>
                  <span>/ hari (~{formatRupiah(plan.estimatedCostPerMonth)}/bln)</span>
                </div>
              </div>

              <p className="plan-desc">{plan.description}</p>

              <div className="plan-items-table">
                <small>RINCIAN MENU HARIAN:</small>
                {plan.items.map((item) => (
                  <div key={item.name} className="item-row">
                    <span>{item.name}</span>
                    <b>{formatRupiah(item.price)} {item.unit}</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="groceries-view">
          <div className="tier-selector-bar">
            <span>PILIH TIER BELANJA:</span>
            <button
              type="button"
              className={`tier-btn ${selectedTier === 'low' ? 'active' : ''}`}
              onClick={() => setSelectedTier('low')}
            >
              HEMAT (MINIMARKET DASAR)
            </button>
            <button
              type="button"
              className={`tier-btn ${selectedTier === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedTier('medium')}
            >
              STANDAR (ALFAMART / INDOMARET)
            </button>
            <button
              type="button"
              className={`tier-btn ${selectedTier === 'high' ? 'active' : ''}`}
              onClick={() => setSelectedTier('high')}
            >
              PREMIUM (SUPERMARKET)
            </button>
          </div>

          <div className="basket-detail-card">
            <div className="basket-head">
              <div>
                <small className="accent">KATALOG RETAIL / ESTIMASI KASIR</small>
                <h4>{activeBasket.title}</h4>
              </div>
              <div className="basket-total">
                <small>TOTAL BELANJA BULANAN</small>
                <strong>{formatRupiah(activeBasket.totalCost)}</strong>
              </div>
            </div>

            <div className="basket-items-grid">
              {activeBasket.items.map((item) => (
                <div key={item.name} className="basket-item-box">
                  <div className="item-name-qty">
                    <b>{item.name}</b>
                    <span className="qty-tag">{item.quantity}</span>
                  </div>
                  <strong className="item-price">{formatRupiah(item.price)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
