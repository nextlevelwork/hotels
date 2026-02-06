import type { Hotel } from '@/data/types';
import type { OstrovokSerpHotel, OstrovokSerpRate, OstrovokHotelInfo } from '../types';
import { resolveEnrichment } from '../enrichment';
import { slugify } from '@/lib/utils';

// Маппинг SERP-результатов в наши Hotel (сокращённые данные — без фото и описания).
// Полные данные загружаются при переходе на страницу отеля.

function getLowestSerpPrice(rates: OstrovokSerpRate[]): number {
  if (!rates.length) return 0;
  return Math.min(
    ...rates.map(r => {
      const showAmount = r.payment_options.payment_types[0]?.show_amount;
      return showAmount ? parseFloat(showAmount) : Infinity;
    })
  );
}

export function mapSerpHotelToHotel(
  serpHotel: OstrovokSerpHotel,
  hotelInfo?: OstrovokHotelInfo,
  cityId?: string,
  cityName?: string
): Hotel {
  const enrichment = resolveEnrichment(serpHotel.hid);
  const price = getLowestSerpPrice(serpHotel.rates);

  const name = hotelInfo?.name || `Отель #${serpHotel.hid}`;
  const address = hotelInfo?.address || '';

  return {
    id: `ostrovok-${serpHotel.hid}`,
    ostrovokHid: serpHotel.hid,
    name,
    slug: slugify(name),
    cityId: cityId || 'unknown',
    cityName: cityName || '',
    type: hotelInfo ? mapKindToType(hotelInfo.kind) : 'hotel',
    stars: hotelInfo?.star_rating || undefined,
    rating: 0,
    reviewsCount: 0,
    address,
    coordinates: {
      lat: hotelInfo?.latitude || 0,
      lng: hotelInfo?.longitude || 0,
    },
    description: '',
    shortDescription: '',
    priceFrom: Math.round(price),
    totalPrice: Math.round(price),
    photos: hotelInfo?.images_ext?.slice(0, 5).map((img, i) => ({
      url: img.url.startsWith('//') ? `https:${img.url}` : img.url,
      alt: `${name} — фото ${i + 1}`,
      isMain: i === 0,
    })) || [],
    videoUrl: enrichment.videoUrl,
    hasVideoVerification: enrichment.hasVideoVerification,
    badges: enrichment.badges,
    measurements: enrichment.measurements,
    amenities: [],
    checkIn: hotelInfo?.check_in_time || '14:00',
    checkOut: hotelInfo?.check_out_time || '12:00',
    cancellationPolicy: '',
    bidEnabled: enrichment.bidEnabled,
    sourceProvider: 'ostrovok',
    isVerified: enrichment.isVerified,
  };
}

function mapKindToType(kind: string): Hotel['type'] {
  const kindLower = kind.toLowerCase();
  if (kindLower.includes('hostel')) return 'hostel';
  if (kindLower.includes('apart')) return 'apartment';
  if (kindLower.includes('resort')) return 'resort';
  if (kindLower.includes('boutique')) return 'boutique';
  return 'hotel';
}
