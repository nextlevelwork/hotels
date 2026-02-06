'use client';

import { ArrowUpDown } from 'lucide-react';
import type { SearchFilters } from '@/data/types';

interface SortDropdownProps {
  value: SearchFilters['sortBy'];
  onChange: (sort: SearchFilters['sortBy']) => void;
}

const options: { value: NonNullable<SearchFilters['sortBy']>; label: string }[] = [
  { value: 'rating', label: 'По рейтингу' },
  { value: 'price-asc', label: 'Сначала дешёвые' },
  { value: 'price-desc', label: 'Сначала дорогие' },
  { value: 'reviews', label: 'По отзывам' },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted" />
      <select
        value={value || 'rating'}
        onChange={(e) => onChange(e.target.value as SearchFilters['sortBy'])}
        className="text-sm font-medium bg-transparent outline-none cursor-pointer text-foreground"
        aria-label="Сортировка"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
