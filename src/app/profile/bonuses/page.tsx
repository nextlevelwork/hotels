'use client';

import { useEffect, useState } from 'react';
import { Gift, Star, TrendingUp, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';
import { LOYALTY_TIERS } from '@/lib/loyalty';

interface BonusData {
  balance: number;
  totalSpent: number;
  tier: {
    tier: string;
    label: string;
    cashbackPercent: number;
    color: string;
    bgColor: string;
  };
  nextTier: {
    label: string;
    remaining: number;
    cashbackPercent: number;
  } | null;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export default function BonusesPage() {
  const [data, setData] = useState<BonusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile/bonus')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted">
        Загрузка...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted">
        Не удалось загрузить данные о бонусах
      </div>
    );
  }

  const progressPercent = data.nextTier
    ? Math.min(100, Math.round(((data.nextTier.remaining > 0 ? data.totalSpent : 0) / (data.totalSpent + (data.nextTier?.remaining || 0))) * 100))
    : 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Бонусная программа</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Gift className="h-5 w-5" />
            Бонусный баланс
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
            <Star className="h-3 w-3" /> {data.tier.label}
          </span>
        </div>
        <div className="text-4xl font-bold mb-1">
          {formatPriceShort(data.balance)}
        </div>
        <div className="text-white/70 text-sm">
          Кешбэк {data.tier.cashbackPercent}% с каждого бронирования
        </div>
      </div>

      {/* Tier Progress */}
      <div className="bg-white rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-medium">Прогресс уровня</span>
          </div>
          <span className="text-sm text-muted">
            Потрачено: {formatPriceShort(data.totalSpent)}
          </span>
        </div>

        {/* Tier badges */}
        <div className="flex justify-between mb-2">
          {[...LOYALTY_TIERS].reverse().map((t) => (
            <span
              key={t.tier}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                data.tier.tier === t.tier ? `${t.bgColor} ${t.color}` : 'text-muted'
              }`}
            >
              {t.label} ({t.cashbackPercent}%)
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className="bg-primary rounded-full h-2.5 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {data.nextTier ? (
          <p className="text-xs text-muted">
            До уровня <span className="font-medium">{data.nextTier.label}</span> осталось {formatPriceShort(data.nextTier.remaining)} бронирований
          </p>
        ) : (
          <p className="text-xs text-success font-medium">
            Максимальный уровень достигнут!
          </p>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">История операций</h2>
        </div>

        {data.transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted text-sm">
            Операций пока нет. Бонусы начисляются после выезда из отеля.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-success/10' : 'bg-danger/10'
                  }`}>
                    {tx.amount > 0 ? (
                      <ArrowDownRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-danger" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{tx.description}</div>
                    <div className="text-xs text-muted">
                      {new Date(tx.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  tx.amount > 0 ? 'text-success' : 'text-danger'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{formatPriceShort(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Program Info */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-sm text-blue-900 mb-2">Как работает программа лояльности</h3>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>Бонусы начисляются автоматически после выезда из отеля</li>
              <li>Кешбэк зависит от уровня: Бронза 5%, Серебро 7%, Золото 10%</li>
              <li>Уровень определяется суммой подтверждённых бронирований</li>
              <li>Бонусами можно оплатить до 50% стоимости бронирования</li>
              <li>Бонусы не имеют срока действия</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
