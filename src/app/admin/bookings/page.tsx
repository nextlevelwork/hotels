'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface Booking {
  id: string;
  bookingId: string;
  hotelName: string;
  roomName: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  finalPrice: number;
  status: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await fetch(`/api/admin/bookings?${params}`);
      const data = await res.json();
      setBookings(data.bookings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await fetch(`/api/admin/bookings/${cancelTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Бронирования</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">Всего: {total}</span>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (statusFilter) params.set('status', statusFilter);
              window.open(`/api/admin/bookings/export?${params}`, '_blank');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white text-sm font-medium text-muted hover:bg-gray-50 hover:text-foreground transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Поиск по ID, отелю, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Все статусы</option>
          <option value="confirmed">Подтверждено</option>
          <option value="cancelled">Отменено</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted bg-gray-50/50">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Отель</th>
                <th className="px-5 py-3 font-medium">Номер</th>
                <th className="px-5 py-3 font-medium">Гость</th>
                <th className="px-5 py-3 font-medium">Даты</th>
                <th className="px-5 py-3 font-medium">Цена</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted">
                    Бронирования не найдены
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs whitespace-nowrap">{b.bookingId}</td>
                    <td className="px-5 py-3 max-w-[180px] truncate">{b.hotelName}</td>
                    <td className="px-5 py-3 max-w-[140px] truncate">{b.roomName}</td>
                    <td className="px-5 py-3">
                      <div className="whitespace-nowrap">{b.guestFirstName} {b.guestLastName}</div>
                      <div className="text-xs text-muted">{b.guestEmail}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs">
                      {b.checkIn} — {b.checkOut}
                    </td>
                    <td className="px-5 py-3 font-medium whitespace-nowrap">{formatPriceShort(b.finalPrice)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          className="text-xs text-danger hover:underline cursor-pointer"
                        >
                          Отменить
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 text-sm text-muted hover:text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </button>
            <span className="text-sm text-muted">
              Страница {page} из {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 text-sm text-muted hover:text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Вперёд
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Отменить бронирование?" size="sm">
        <p className="text-sm text-muted mb-4">
          Вы уверены, что хотите отменить бронирование{' '}
          <span className="font-mono font-bold text-foreground">{cancelTarget?.bookingId}</span>?
          Это действие нельзя отменить.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)} className="flex-1">
            Нет, оставить
          </Button>
          <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancel} className="flex-1">
            Да, отменить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
