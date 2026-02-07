'use client';

import { useEffect, useState } from 'react';
import { Gift, Search, X } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface LoyaltyUser {
  id: string;
  name: string | null;
  email: string;
  bonusBalance: number;
  totalSpent: number;
  tier: string;
  tierColor: string;
  tierBgColor: string;
}

export default function AdminLoyaltyPage() {
  const [users, setUsers] = useState<LoyaltyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustModal, setAdjustModal] = useState<LoyaltyUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const loadUsers = () => {
    fetch('/api/admin/loyalty')
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleAdjust = async () => {
    if (!adjustModal || !adjustAmount) return;
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount === 0) return;

    setAdjusting(true);
    try {
      const res = await fetch(`/api/admin/loyalty/${adjustModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description: adjustDesc }),
      });
      if (res.ok) {
        setAdjustModal(null);
        setAdjustAmount('');
        setAdjustDesc('');
        loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка');
      }
    } finally {
      setAdjusting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Лояльность</h1>
        <div className="bg-white rounded-xl border border-border p-8 text-center text-muted">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Лояльность</h1>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Gift className="h-4 w-4" />
          {users.length} пользователей
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или email..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-5 py-3 font-medium">Пользователь</th>
              <th className="px-5 py-3 font-medium">Уровень</th>
              <th className="px-5 py-3 font-medium">Баланс</th>
              <th className="px-5 py-3 font-medium">Потрачено</th>
              <th className="px-5 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="font-medium">{u.name || 'Без имени'}</div>
                  <div className="text-xs text-muted">{u.email}</div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.tierBgColor} ${u.tierColor}`}>
                    {u.tier}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium">
                  {formatPriceShort(u.bonusBalance)}
                </td>
                <td className="px-5 py-3 text-muted">
                  {formatPriceShort(u.totalSpent)}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => {
                      setAdjustModal(u);
                      setAdjustAmount('');
                      setAdjustDesc('');
                    }}
                    className="text-primary hover:underline text-sm cursor-pointer"
                  >
                    Корректировка
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  Пользователи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Корректировка баланса</h2>
              <button onClick={() => setAdjustModal(null)} className="text-muted hover:text-foreground cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-muted mb-1">Пользователь</div>
              <div className="font-medium">{adjustModal.name || adjustModal.email}</div>
              <div className="text-sm text-muted">Текущий баланс: {formatPriceShort(adjustModal.bonusBalance)}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Сумма (+ начисление, − списание)</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="1000 или -500"
                className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Причина (необязательно)</label>
              <input
                value={adjustDesc}
                onChange={(e) => setAdjustDesc(e.target.value)}
                placeholder="Компенсация, промо-акция..."
                className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setAdjustModal(null)}>
                Отмена
              </Button>
              <Button fullWidth onClick={handleAdjust} loading={adjusting}>
                Применить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
