'use client';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

const presets = [
  { label: 'Сегодня', getDates: () => { const d = fmt(new Date()); return [d, d]; } },
  { label: 'Неделя', getDates: () => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 7); return [fmt(start), fmt(end)]; } },
  { label: 'Месяц', getDates: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 1); return [fmt(start), fmt(end)]; } },
  { label: 'Год', getDates: () => { const end = new Date(); const start = new Date(); start.setFullYear(start.getFullYear() - 1); return [fmt(start), fmt(end)]; } },
  { label: 'Всё время', getDates: () => ['', ''] },
];

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <span className="text-muted text-sm">—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const [s, e] = preset.getDates();
              onChange(s, e);
            }}
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium text-muted hover:bg-gray-50 hover:text-foreground transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
