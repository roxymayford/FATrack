import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatRupiah } from '../lib/calculator';

interface AllocationChartProps {
  targetNeeds: number;
  targetWants: number;
  targetSavings: number;
  actualNeeds: number;
  actualWants: number;
  actualSavings: number;
}

const COLORS = {
  needs: '#111111',
  wants: '#ff4d25',
  savings: '#008547',
};

export const AllocationChart: React.FC<AllocationChartProps> = ({
  targetNeeds,
  targetWants,
  targetSavings,
  actualNeeds,
  actualWants,
  actualSavings,
}) => {
  const totalActual = actualNeeds + actualWants + actualSavings;
  const totalTarget = targetNeeds + targetWants + targetSavings;

  // Actual pie chart data
  const data = [
    { name: 'Needs (Pokok)', value: actualNeeds || 0.001, nominal: actualNeeds, target: targetNeeds, color: COLORS.needs },
    { name: 'Wants (Lifestyle)', value: actualWants || 0.001, nominal: actualWants, target: targetWants, color: COLORS.wants },
    { name: 'Savings (Tabungan)', value: actualSavings || 0.001, nominal: actualSavings, target: targetSavings, color: COLORS.savings },
  ];

  const needsDev = targetNeeds > 0 ? ((actualNeeds - targetNeeds) / targetNeeds) * 100 : 0;
  const wantsDev = targetWants > 0 ? ((actualWants - targetWants) / targetWants) * 100 : 0;
  const savingsDev = targetSavings > 0 ? ((actualSavings - targetSavings) / targetSavings) * 100 : 0;

  return (
    <div className="allocation-chart-widget">
      <div className="chart-header">
        <div>
          <small className="accent">REALISASI VS TARGET</small>
          <h4>KOMPOSISI PENGELUARAN</h4>
        </div>
        <small>TOTAL REALISASI: {formatRupiah(totalActual)}</small>
      </div>

      <div className="chart-and-legend-grid">
        <div className="donut-container" style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="#efece6"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  formatRupiah(item.payload.nominal),
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#fcf9f3',
                  border: '1px solid #111',
                  borderRadius: 0,
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  letterSpacing: '0.05em',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center-label">
            <small>KAS KELUAR</small>
            <b>{totalActual > 0 ? formatRupiah(totalActual) : 'Rp 0'}</b>
          </div>
        </div>

        <div className="chart-breakdown-table">
          <div className="breakdown-row">
            <div className="row-left">
              <span className="dot" style={{ backgroundColor: COLORS.needs }} />
              <div>
                <b>NEEDS</b>
                <small>Target: {formatRupiah(targetNeeds)}</small>
              </div>
            </div>
            <div className="row-right">
              <strong>{formatRupiah(actualNeeds)}</strong>
              <small className={needsDev > 10 ? 'red-text' : 'muted-text'}>
                {needsDev > 0 ? `+${needsDev.toFixed(1)}%` : `${needsDev.toFixed(1)}%`}
              </small>
            </div>
          </div>

          <div className="breakdown-row">
            <div className="row-left">
              <span className="dot" style={{ backgroundColor: COLORS.wants }} />
              <div>
                <b>WANTS</b>
                <small>Target: {formatRupiah(targetWants)}</small>
              </div>
            </div>
            <div className="row-right">
              <strong className="accent">{formatRupiah(actualWants)}</strong>
              <small className={wantsDev > 0 ? 'red-text' : 'green-text'}>
                {wantsDev > 0 ? `+${wantsDev.toFixed(1)}% OVER` : `${wantsDev.toFixed(1)}%`}
              </small>
            </div>
          </div>

          <div className="breakdown-row">
            <div className="row-left">
              <span className="dot" style={{ backgroundColor: COLORS.savings }} />
              <div>
                <b>SAVINGS</b>
                <small>Target: {formatRupiah(targetSavings)}</small>
              </div>
            </div>
            <div className="row-right">
              <strong className="green-text">{formatRupiah(actualSavings)}</strong>
              <small className={savingsDev >= 0 ? 'green-text' : 'red-text'}>
                {savingsDev >= 0 ? `+${savingsDev.toFixed(1)}% TERCAPAI` : `${savingsDev.toFixed(1)}%`}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
