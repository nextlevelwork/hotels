'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/format';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ReviewItem {
  id: string;
  hotelSlug: string;
  authorName: string;
  rating: number;
  title: string;
  text: string;
  travelerType: string;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string };
}

const statusLabels: Record<string, string> = {
  approved: 'Одобрен',
  rejected: 'Отклонён',
};

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function ratingColor(rating: number): string {
  if (rating >= 9) return 'bg-primary text-white';
  if (rating >= 7) return 'bg-success text-white';
  if (rating >= 5) return 'bg-warning text-white';
  return 'bg-danger text-white';
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/reviews/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Отзывы</h1>
        <span className="text-sm text-muted">Всего: {total}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Поиск по автору, отелю, заголовку..."
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
          <option value="approved">Одобренные</option>
          <option value="rejected">Отклонённые</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted bg-gray-50/50">
                <th className="px-5 py-3 font-medium">Автор</th>
                <th className="px-5 py-3 font-medium">Отель</th>
                <th className="px-5 py-3 font-medium">Оценка</th>
                <th className="px-5 py-3 font-medium">Заголовок</th>
                <th className="px-5 py-3 font-medium">Дата</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Отзывы не найдены
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="whitespace-nowrap font-medium">{r.authorName}</div>
                      <div className="text-xs text-muted">{r.user.email}</div>
                    </td>
                    <td className="px-5 py-3 max-w-[140px] truncate">{r.hotelSlug}</td>
                    <td className="px-5 py-3">
                      <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold', ratingColor(r.rating))}>
                        {r.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3 max-w-[200px] truncate">{r.title}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-muted">
                      {formatRelative(r.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', statusColors[r.status] || 'bg-gray-100 text-gray-700')}>
                        {statusLabels[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'approved')}
                            className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors cursor-pointer"
                            title="Одобрить"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'rejected')}
                            className="p-1.5 rounded-lg text-warning hover:bg-warning/10 transition-colors cursor-pointer"
                            title="Отклонить"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Удалить отзыв?" size="sm">
        <p className="text-sm text-muted mb-4">
          Вы уверены, что хотите удалить отзыв от{' '}
          <span className="font-bold text-foreground">{deleteTarget?.authorName}</span>?
          Это действие нельзя отменить.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} className="flex-1">
            Отмена
          </Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete} className="flex-1">
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
