'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Users, DollarSign, CalendarCheck, Gift, TrendingDown, BarChart3 } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';
import DateRangePicker from '@/components/admin/DateRangePicker';
import { RevenueChart, BookingsChart, PaymentMethodsChart } from '@/components/admin/Charts';

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

interface AnalyticsData {
  revenue: Array<{ date: string; amount: number; count: number }>;
  bookingsByStatus: { confirmed: number; cancelled: number };
  topHotels: Array<{ hotelName: string; revenue: number; bookings: number }>;
  paymentMethods: Record<string, number>;
  averageBooking: { averageCheck: number; averageNights: number };
}

const statusLabels: Record<string, string> = {
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

type Tab = 'overview' | 'charts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    params.set('groupBy', groupBy);

    try {
      const res = await fetch(`/api/admin/analytics?${params}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  }, [startDate, endDate, groupBy]);

  useEffect(() => {
    if (tab === 'charts') {
      fetchAnalytics();
    }
  }, [tab, fetchAnalytics]);

  const handleDateChange = (s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Дашборд</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Обзор
        </button>
        <button
          onClick={() => setTab('charts')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === 'charts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Графики
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <>
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
        </>
      )}

      {/* Charts Tab */}
      {tab === 'charts' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <DateRangePicker startDate={startDate} endDate={endDate} onChange={handleDateChange} />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="day">По дням</option>
              <option value="week">По неделям</option>
              <option value="month">По месяцам</option>
            </select>
          </div>

          {!analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-80" />
              ))}
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-sm text-muted">Средний чек</div>
                  <div className="text-xl font-bold mt-1">{formatPriceShort(analytics.averageBooking.averageCheck)}</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-sm text-muted">Сред. ночей</div>
                  <div className="text-xl font-bold mt-1">{analytics.averageBooking.averageNights}</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-sm text-muted">Подтверждено</div>
                  <div className="text-xl font-bold mt-1 text-green-600">{analytics.bookingsByStatus.confirmed}</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-sm text-muted">Отменено</div>
                  <div className="text-xl font-bold mt-1 text-red-600">{analytics.bookingsByStatus.cancelled}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RevenueChart data={analytics.revenue} />
                <BookingsChart data={analytics.revenue} />
                <PaymentMethodsChart data={analytics.paymentMethods} />

                {/* Top Hotels Table */}
                <div className="bg-white rounded-xl border border-border p-5">
                  <h3 className="font-semibold mb-4">Топ-5 отелей</h3>
                  {analytics.topHotels.length === 0 ? (
                    <p className="text-muted text-sm text-center py-8">Нет данных</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted">
                          <th className="pb-2 font-medium">Отель</th>
                          <th className="pb-2 font-medium text-right">Выручка</th>
                          <th className="pb-2 font-medium text-right">Броней</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topHotels.map((hotel, i) => (
                          <tr key={hotel.hotelName} className="border-b border-border last:border-b-0">
                            <td className="py-2.5">
                              <span className="text-muted mr-2">{i + 1}.</span>
                              <span className="font-medium">{hotel.hotelName}</span>
                            </td>
                            <td className="py-2.5 text-right font-medium">{formatPriceShort(hotel.revenue)}</td>
                            <td className="py-2.5 text-right text-muted">{hotel.bookings}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
