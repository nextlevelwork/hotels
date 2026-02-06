import type { Hotel, HotelPhoto } from '@/data/types';
import type {
  OstrovokHotelInfo,
  OstrovokHotelpageRate,
} from '../types';
import { resolveEnrichment } from '../enrichment';
import { slugify } from '@/lib/utils';
import { getCityIdByRegion } from '@/data/region-map';
import { getCityById } from '@/data/cities';

function mapKindToType(kind: string): Hotel['type'] {
  const kindLower = kind.toLowerCase();
  if (kindLower.includes('hostel')) return 'hostel';
  if (kindLower.includes('apart')) return 'apartment';
  if (kindLower.includes('resort')) return 'resort';
  if (kindLower.includes('boutique')) return 'boutique';
  if (kindLower.includes('glamping') || kindLower.includes('camp')) return 'glamping';
  if (kindLower.includes('capsule')) return 'capsule';
  return 'hotel';
}

function mapPhotos(info: OstrovokHotelInfo): HotelPhoto[] {
  if (info.images_ext && info.images_ext.length > 0) {
    return info.images_ext.map((img, i) => ({
      url: img.url.startsWith('//') ? `https:${img.url}` : img.url,
      alt: `${info.name} — фото ${i + 1}`,
      isMain: i === 0,
    }));
  }
  if (info.images && info.images.length > 0) {
    return info.images.map((url, i) => ({
      url: url.startsWith('//') ? `https:${url}` : url,
      alt: `${info.name} — фото ${i + 1}`,
      isMain: i === 0,
    }));
  }
  return [];
}

function extractDescription(info: OstrovokHotelInfo): { description: string; shortDescription: string } {
  let description = '';
  if (info.description_struct && info.description_struct.length > 0) {
    description = info.description_struct
      .map(d => d.paragraphs.join(' '))
      .join('\n\n');
  }
  const shortDescription = description.length > 200
    ? description.slice(0, 200).trimEnd() + '…'
    : description || info.name;

  return { description: description || info.name, shortDescription };
}

function extractAmenities(info: OstrovokHotelInfo): string[] {
  if (!info.amenity_groups) return [];
  return info.amenity_groups.flatMap(g => g.amenities).slice(0, 30);
}

function extractCancellationPolicy(rates: OstrovokHotelpageRate[]): string {
  if (!rates.length) return 'Уточняйте при бронировании';
  const firstRate = rates[0];
  if (firstRate.cancellation_penalties.free_cancellation_before) {
    const date = new Date(firstRate.cancellation_penalties.free_cancellation_before);
    return `Бесплатная отмена до ${date.toLocaleDateString('ru-RU')}`;
  }
  return 'Без бесплатной отмены';
}

function getLowestPrice(rates: OstrovokHotelpageRate[]): number {
  if (!rates.length) return 0;
  return Math.min(
    ...rates.map(r => {
      const showAmount = r.payment_options.payment_types[0]?.show_amount;
      return showAmount ? parseFloat(showAmount) : Infinity;
    })
  );
}

export function mapOstrovokHotelToHotel(
  info: OstrovokHotelInfo,
  rates: OstrovokHotelpageRate[] = []
): Hotel {
  const enrichment = resolveEnrichment(info.hid);
  const { description, shortDescription } = extractDescription(info);
  const photos = mapPhotos(info);
  const priceFrom = getLowestPrice(rates);

  // Resolve city info
  const regionId = info.region ? parseInt(info.region.name, 10) : 0;
  const cityId = getCityIdByRegion(regionId) || 'unknown';
  const city = getCityById(cityId);

  return {
    id: `ostrovok-${info.hid}`,
    ostrovokHid: info.hid,
    name: info.name,
    slug: slugify(info.name),
    cityId: cityId,
    cityName: city?.name || info.region?.name || '',
    type: mapKindToType(info.kind),
    stars: info.star_rating || undefined,
    rating: 0, // Ostrovok не возвращает пользовательский рейтинг напрямую
    reviewsCount: 0,
    address: info.address,
    coordinates: {
      lat: info.latitude,
      lng: info.longitude,
    },
    description,
    shortDescription,
    priceFrom: Math.round(priceFrom),
    totalPrice: Math.round(priceFrom),
    photos,
    videoUrl: enrichment.videoUrl,
    hasVideoVerification: enrichment.hasVideoVerification,
    badges: enrichment.badges,
    measurements: enrichment.measurements,
    amenities: extractAmenities(info),
    checkIn: info.check_in_time || '14:00',
    checkOut: info.check_out_time || '12:00',
    cancellationPolicy: extractCancellationPolicy(rates),
    bidEnabled: enrichment.bidEnabled,
    sourceProvider: 'ostrovok',
    isVerified: enrichment.isVerified,
  };
}
