'use client';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface RevenueData {
  date: string;
  amount: number;
  count: number;
}

interface PaymentMethodData {
  name: string;
  value: number;
}

const paymentLabels: Record<string, string> = {
  card: 'Карта',
  sbp: 'СБП',
  cash: 'Наличные',
  unknown: 'Неизвестно',
};

function formatRub(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value} ₽`;
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-4">Выручка</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatRub} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Выручка']}
              labelStyle={{ fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BookingsChart({ data }: { data: RevenueData[] }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-4">Бронирования</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, 'Бронирований']}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PaymentMethodsChart({ data }: { data: Record<string, number> }) {
  const chartData: PaymentMethodData[] = Object.entries(data).map(([name, value]) => ({
    name: paymentLabels[name] || name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Способы оплаты</h3>
        <p className="text-muted text-sm text-center py-8">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-4">Способы оплаты</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
