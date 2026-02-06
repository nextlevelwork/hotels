'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Volume2, Wifi, Monitor, Video, Handshake, Star, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { SearchFilters } from '@/data/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  className?: string;
}

export default function FilterPanel({ filters, onChange, onReset, className }: FilterPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    price: true,
    stars: true,
    type: true,
    measurements: true,
    features: false,
  });

  const toggle = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeCount = [
    filters.priceMin || filters.priceMax,
    filters.stars?.length,
    filters.types?.length,
    filters.noiseMax || filters.wifiMin || filters.hasWorkspace,
    filters.hasVideoVerification || filters.bidEnabled || filters.hasGuarantee,
  ].filter(Boolean).length;

  return (
    <div className={cn('bg-white rounded-xl border border-border p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Фильтры</h3>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
            <X className="h-3.5 w-3.5" />
            Сбросить ({activeCount})
          </button>
        )}
      </div>

      {/* Price */}
      <FilterSection title="Цена за ночь" expanded={expanded.price} onToggle={() => toggle('price')}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="от"
            value={filters.priceMin || ''}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            placeholder="до"
            value={filters.priceMax || ''}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[
            { label: 'до 3000', max: 3000 },
            { label: '3-7 тыс', min: 3000, max: 7000 },
            { label: '7-15 тыс', min: 7000, max: 15000 },
            { label: '15+ тыс', min: 15000 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange({ ...filters, priceMin: preset.min, priceMax: preset.max })}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                filters.priceMin === preset.min && filters.priceMax === preset.max
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted hover:border-primary hover:text-primary'
              )}
            >
              {preset.label} ₽
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Stars */}
      <FilterSection title="Звёзды" expanded={expanded.stars} onToggle={() => toggle('stars')}>
        <div className="flex gap-2">
          {[5, 4, 3, 2].map((star) => (
            <button
              key={star}
              onClick={() => {
                const stars = filters.stars || [];
                const next = stars.includes(star) ? stars.filter(s => s !== star) : [...stars, star];
                onChange({ ...filters, stars: next.length ? next : undefined });
              }}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer',
                filters.stars?.includes(star)
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted hover:border-primary'
              )}
            >
              {star} <Star className="h-3.5 w-3.5 fill-current" />
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Type */}
      <FilterSection title="Тип" expanded={expanded.type} onToggle={() => toggle('type')}>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'hotel', label: 'Отель' },
            { value: 'hostel', label: 'Хостел' },
            { value: 'apartment', label: 'Апартаменты' },
            { value: 'boutique', label: 'Бутик' },
            { value: 'resort', label: 'Курорт' },
            { value: 'capsule', label: 'Капсулы' },
            { value: 'glamping', label: 'Глэмпинг' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => {
                const types = filters.types || [];
                const next = types.includes(type.value) ? types.filter(t => t !== type.value) : [...types, type.value];
                onChange({ ...filters, types: next.length ? next : undefined });
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer',
                filters.types?.includes(type.value)
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted hover:border-primary'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Smart Measurements */}
      <FilterSection title="Умные фильтры" expanded={expanded.measurements} onToggle={() => toggle('measurements')}>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="range"
              min={15}
              max={50}
              value={filters.noiseMax || 50}
              onChange={(e) => onChange({ ...filters, noiseMax: Number(e.target.value) < 50 ? Number(e.target.value) : undefined })}
              className="flex-1 accent-primary"
            />
            <span className="flex items-center gap-1 text-sm w-24">
              <Volume2 className="h-4 w-4 text-muted" />
              {filters.noiseMax ? `≤${filters.noiseMax} дБ` : 'Любой'}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="range"
              min={0}
              max={300}
              step={10}
              value={filters.wifiMin || 0}
              onChange={(e) => onChange({ ...filters, wifiMin: Number(e.target.value) > 0 ? Number(e.target.value) : undefined })}
              className="flex-1 accent-primary"
            />
            <span className="flex items-center gap-1 text-sm w-24">
              <Wifi className="h-4 w-4 text-muted" />
              {filters.wifiMin ? `≥${filters.wifiMin} Мб/с` : 'Любой'}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.hasWorkspace}
              onChange={(e) => onChange({ ...filters, hasWorkspace: e.target.checked || undefined })}
              className="w-4 h-4 rounded accent-primary"
            />
            <Monitor className="h-4 w-4 text-muted" />
            <span className="text-sm">Рабочее место</span>
          </label>
        </div>
      </FilterSection>

      {/* Features */}
      <FilterSection title="Особенности" expanded={expanded.features} onToggle={() => toggle('features')}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.hasVideoVerification}
              onChange={(e) => onChange({ ...filters, hasVideoVerification: e.target.checked || undefined })}
              className="w-4 h-4 rounded accent-primary"
            />
            <Video className="h-4 w-4 text-muted" />
            <span className="text-sm">Видеоверификация</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.bidEnabled}
              onChange={(e) => onChange({ ...filters, bidEnabled: e.target.checked || undefined })}
              className="w-4 h-4 rounded accent-primary"
            />
            <Handshake className="h-4 w-4 text-muted" />
            <span className="text-sm">Возможен торг</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.hasGuarantee}
              onChange={(e) => onChange({ ...filters, hasGuarantee: e.target.checked || undefined })}
              className="w-4 h-4 rounded accent-primary"
            />
            <ShieldCheck className="h-4 w-4 text-muted" />
            <span className="text-sm">Гарантия заселения</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full cursor-pointer"
        aria-expanded={expanded}
        aria-controls={`filter-${title}`}
      >
        <span className="font-medium text-sm">{title}</span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
      </button>
      {expanded && <div className="mt-3" id={`filter-${title}`} role="region" aria-label={title}>{children}</div>}
    </div>
  );
}
