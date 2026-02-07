'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { bookings: number };
}

const roleLabels: Record<string, string> = {
  user: 'Пользователь',
  admin: 'Админ',
};

const roleColors: Record<string, string> = {
  user: 'bg-gray-100 text-gray-700',
  admin: 'bg-purple-100 text-purple-700',
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleTarget, setRoleTarget] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openRoleModal = (user: UserRow) => {
    setRoleTarget(user);
    setNewRole(user.role === 'admin' ? 'user' : 'admin');
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${roleTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Ошибка');
        return;
      }
      setRoleTarget(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <span className="text-sm text-muted">Всего: {total}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Все роли</option>
          <option value="user">Пользователь</option>
          <option value="admin">Админ</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted bg-gray-50/50">
                <th className="px-5 py-3 font-medium">Имя</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Телефон</th>
                <th className="px-5 py-3 font-medium">Роль</th>
                <th className="px-5 py-3 font-medium">Бронирований</th>
                <th className="px-5 py-3 font-medium">Регистрация</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === session?.user?.id;
                  return (
                    <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{u.name || '—'}</td>
                      <td className="px-5 py-3">{u.email}</td>
                      <td className="px-5 py-3 text-muted">{u.phone || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">{u._count.bookings}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-5 py-3">
                        {!isSelf && (
                          <button
                            onClick={() => openRoleModal(u)}
                            className="text-xs text-primary hover:underline cursor-pointer"
                          >
                            {u.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                          </button>
                        )}
                        {isSelf && (
                          <span className="text-xs text-muted">Вы</span>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {/* Role change modal */}
      <Modal isOpen={!!roleTarget} onClose={() => setRoleTarget(null)} title="Изменить роль" size="sm">
        <p className="text-sm text-muted mb-4">
          Изменить роль пользователя{' '}
          <span className="font-bold text-foreground">{roleTarget?.name || roleTarget?.email}</span>{' '}
          на <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[newRole] || ''}`}>
            {roleLabels[newRole] || newRole}
          </span>?
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setRoleTarget(null)} className="flex-1">
            Отмена
          </Button>
          <Button variant="primary" size="sm" loading={updating} onClick={handleRoleChange} className="flex-1">
            Подтвердить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
