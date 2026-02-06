'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';
import { getPriceHistory } from '@/lib/api';
import type { PriceHistoryPoint } from '@/data/types';

interface PriceChartProps {
  hotelId: string;
  currentPrice: number;
}

export default function PriceChart({ hotelId, currentPrice }: PriceChartProps) {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);

  useEffect(() => {
    getPriceHistory(hotelId).then(setHistory);
  }, [hotelId]);

  if (history.length === 0) return null;

  const prices = history.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const range = maxPrice - minPrice || 1;

  const width = 600;
  const height = 120;
  const padding = 10;

  const points = history.map((p, i) => {
    const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p.price - minPrice) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  const isBelow = currentPrice <= avgPrice;

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Динамика цен</h2>
        <div className="flex items-center gap-2">
          {isBelow ? (
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <TrendingDown className="h-4 w-4" />
              Цена ниже средней
            </div>
          ) : (
            <div className="flex items-center gap-1 text-warning text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Цена выше средней
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 mb-4 text-sm">
        <div>
          <div className="text-muted text-xs">Мин.</div>
          <div className="font-semibold">{formatPriceShort(minPrice)}</div>
        </div>
        <div>
          <div className="text-muted text-xs">Средняя</div>
          <div className="font-semibold">{formatPriceShort(avgPrice)}</div>
        </div>
        <div>
          <div className="text-muted text-xs">Макс.</div>
          <div className="font-semibold">{formatPriceShort(maxPrice)}</div>
        </div>
        <div>
          <div className="text-muted text-xs">Сейчас</div>
          <div className="font-bold text-primary">{formatPriceShort(currentPrice)}</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E86AB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2E86AB" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGradient)" />
        <path d={pathD} fill="none" stroke="#2E86AB" strokeWidth="2" strokeLinejoin="round" />
      </svg>

      <div className="flex justify-between text-xs text-muted mt-1">
        <span>30 дней назад</span>
        <span>Сегодня</span>
      </div>
    </div>
  );
}
