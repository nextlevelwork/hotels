'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, DollarSign, CalendarCheck, Gift, TrendingDown } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';

interface Stats {
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  bookingsToday: number;
  totalBonusIssued: number;
  totalBonusSpent: number;
  recentBookings: Array<{
    id: string;
    bookingId: string;
    hotelName: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    finalPrice: number;
    status: string;
    createdAt: string;
  }>;
}

const statusLabels: Record<string, string> = {
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Бронирования', value: stats.totalBookings, icon: BookOpen, color: 'text-primary bg-primary/10' },
    { label: 'Пользователи', value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Выручка', value: formatPriceShort(stats.totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-100' },
    { label: 'Сегодня', value: stats.bookingsToday, icon: CalendarCheck, color: 'text-orange-600 bg-orange-100' },
    { label: 'Бонусы выдано', value: formatPriceShort(stats.totalBonusIssued), icon: Gift, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Бонусы списано', value: formatPriceShort(stats.totalBonusSpent), icon: TrendingDown, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg">Последние бронирования</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Отель</th>
                <th className="px-5 py-3 font-medium">Гость</th>
                <th className="px-5 py-3 font-medium">Дата</th>
                <th className="px-5 py-3 font-medium">Цена</th>
                <th className="px-5 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{b.bookingId}</td>
                  <td className="px-5 py-3 max-w-[200px] truncate">{b.hotelName}</td>
                  <td className="px-5 py-3">
                    <div>{b.guestFirstName} {b.guestLastName}</div>
                    <div className="text-xs text-muted">{b.guestEmail}</div>
                  </td>
                  <td className="px-5 py-3 text-muted whitespace-nowrap">
                    {new Date(b.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-5 py-3 font-medium">{formatPriceShort(b.finalPrice)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentBookings.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">Бронирований пока нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
