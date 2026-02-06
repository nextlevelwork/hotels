import type { RealMeasurements, HotelBadge } from './types';

// Гостинец-специфичные данные для отелей, которые мы проверили лично.
// Ключ — Ostrovok hid (числовой ID отеля).

export interface EnrichmentData {
  measurements: RealMeasurements;
  badges: HotelBadge[];
  videoUrl?: string;
  bidEnabled: boolean;
  isVerified: boolean; // проходил ли отель нашу верификацию
}

// Данные по верифицированным отелям
const enrichmentMap: Record<number, EnrichmentData> = {
  // Пример: Metropol Moscow (hid нужно заменить после проверки через API)
  // 123456: {
  //   measurements: {
  //     noise: { level: 28, rating: 'тихо', measuredAt: '2025-01-15', details: 'Окна во двор, тройной стеклопакет' },
  //     wifi: { speed: 150, rating: 'отлично', measuredAt: '2025-01-15', details: 'Оптоволокно, роутер в номере' },
  //     hasWorkspace: true,
  //     workspaceDetails: 'Большой письменный стол с настольной лампой и розетками',
  //     lastVerified: '2025-01-15',
  //   },
  //   badges: [
  //     { type: 'video-verified', label: 'Видеоверификация' },
  //     { type: 'quiet-zone', label: 'Тихая зона' },
  //     { type: 'fast-wifi', label: 'Быстрый Wi-Fi' },
  //   ],
  //   videoUrl: 'https://youtube.com/...',
  //   bidEnabled: true,
  //   isVerified: true,
  // },
};

export function getEnrichment(hid: number): EnrichmentData | undefined {
  return enrichmentMap[hid];
}

export function getDefaultMeasurements(): RealMeasurements {
  return {
    noise: {
      level: 0,
      rating: 'умеренно',
      measuredAt: '',
      details: 'Замеры не проводились',
    },
    wifi: {
      speed: 0,
      rating: 'средне',
      measuredAt: '',
      details: 'Замеры не проводились',
    },
    hasWorkspace: false,
    workspaceDetails: undefined,
    lastVerified: '',
  };
}

export function getDefaultBadges(): HotelBadge[] {
  return [];
}
