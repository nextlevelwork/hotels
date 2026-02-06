'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatPriceShort } from '@/lib/utils';
import type { Hotel } from '@/data/types';

interface MapViewProps {
  hotels?: Hotel[];
  className?: string;
  onCitySelect?: (cityId: string) => void;
}

// City coordinates mapped to SVG viewBox (approximate positions on Russia map)
const cityPositions: Record<string, { x: number; y: number; name: string }> = {
  kaliningrad: { x: 90, y: 145, name: 'Калининград' },
  moscow: { x: 195, y: 155, name: 'Москва' },
  spb: { x: 165, y: 115, name: 'Санкт-Петербург' },
  kazan: { x: 270, y: 155, name: 'Казань' },
  sochi: { x: 195, y: 225, name: 'Сочи' },
};

export default function MapView({ hotels = [], className, onCitySelect }: MapViewProps) {
  const [activeCity, setActiveCity] = useState<string | null>(null);

  // Group hotels by city
  const hotelsByCity: Record<string, Hotel[]> = {};
  hotels.forEach(h => {
    if (!hotelsByCity[h.cityId]) hotelsByCity[h.cityId] = [];
    hotelsByCity[h.cityId].push(h);
  });

  const activeCityHotels = activeCity ? (hotelsByCity[activeCity] || []) : [];

  return (
    <div className={cn('bg-white rounded-xl border border-border overflow-hidden flex flex-col', className)}>
      {/* SVG Map */}
      <div className="relative flex-1 min-h-0 p-4">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          role="img"
          aria-label="Карта городов с отелями"
        >
          {/* Background */}
          <rect width="400" height="300" fill="#f0f9ff" rx="8" />

          {/* Russia simplified outline */}
          <path
            d="M 60 120 Q 80 100, 120 105 Q 150 95, 180 100 Q 200 90, 220 95 Q 260 85, 300 100 Q 340 95, 370 110 Q 380 130, 370 150 Q 360 170, 340 175 Q 320 190, 290 185 Q 270 195, 250 190 Q 230 210, 220 230 Q 200 240, 180 235 Q 170 225, 175 210 Q 165 195, 150 190 Q 130 185, 110 175 Q 85 170, 70 155 Q 55 140, 60 120 Z"
            fill="#dbeafe"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />

          {/* Water bodies hints */}
          <ellipse cx="60" cy="180" rx="30" ry="15" fill="#bfdbfe" opacity="0.4" />
          <ellipse cx="200" cy="260" rx="50" ry="20" fill="#bfdbfe" opacity="0.4" />

          {/* City pins */}
          {Object.entries(cityPositions).map(([cityId, pos]) => {
            const count = hotelsByCity[cityId]?.length || 0;
            const isActive = activeCity === cityId;
            const hasHotels = count > 0;

            return (
              <g
                key={cityId}
                className="cursor-pointer"
                onClick={() => {
                  const newCity = isActive ? null : cityId;
                  setActiveCity(newCity);
                  if (newCity && onCitySelect) onCitySelect(newCity);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${pos.name}: ${count} отелей`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const newCity = isActive ? null : cityId;
                    setActiveCity(newCity);
                    if (newCity && onCitySelect) onCitySelect(newCity);
                  }
                }}
              >
                {/* Pulse ring for active */}
                {isActive && (
                  <circle cx={pos.x} cy={pos.y} r="18" fill="none" stroke="#2E86AB" strokeWidth="2" opacity="0.3">
                    <animate attributeName="r" from="12" to="22" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Pin circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isActive ? 12 : 10}
                  fill={hasHotels ? (isActive ? '#2E86AB' : '#3b9fc2') : '#94a3b8'}
                  stroke="white"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />

                {/* Count label */}
                {hasHotels && (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {count}
                  </text>
                )}

                {/* City name label */}
                <text
                  x={pos.x}
                  y={pos.y - 16}
                  textAnchor="middle"
                  fill={isActive ? '#1e3a5f' : '#475569'}
                  fontSize="10"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  className="pointer-events-none select-none"
                >
                  {pos.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active city hotel list */}
      {activeCity && activeCityHotels.length > 0 && (
        <div className="border-t border-border max-h-48 overflow-y-auto">
          <div className="p-3 bg-gray-50 text-xs font-semibold text-muted sticky top-0">
            {cityPositions[activeCity]?.name} — {activeCityHotels.length} отелей
          </div>
          {activeCityHotels.slice(0, 5).map(hotel => (
            <a
              key={hotel.id}
              href={`/hotel/${hotel.slug}`}
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-sm border-b border-border last:border-0"
            >
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{hotel.name}</div>
                <div className="text-xs text-muted">{hotel.rating} ★</div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-semibold text-foreground">{formatPriceShort(hotel.priceFrom)}</div>
                <div className="text-xs text-muted">за ночь</div>
              </div>
            </a>
          ))}
          {activeCityHotels.length > 5 && (
            <div className="p-2 text-center text-xs text-primary font-medium">
              + ещё {activeCityHotels.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
