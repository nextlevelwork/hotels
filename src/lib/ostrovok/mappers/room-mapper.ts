import type { RoomType, HotelPhoto } from '@/data/types';
import type { OstrovokHotelpageRate, OstrovokRoomGroup } from '../types';

const ROOM_CLASS_MAP: Record<number, string> = {
  0: 'Стандарт',
  1: 'Стандарт',
  2: 'Стандарт',
  3: 'Стандарт улучшенный',
  4: 'Супериор',
  5: 'Делюкс',
  6: 'Студия',
  7: 'Люкс',
  8: 'Полулюкс',
  9: 'Апартамент',
  10: 'Апартамент',
};

function getBedType(capacity: number): string {
  if (capacity <= 1) return 'Односпальная кровать';
  if (capacity === 2) return 'Двуспальная кровать';
  return `${capacity} спальных места`;
}

function mapMealToLabel(mealValue: string, hasBreakfast: boolean): boolean {
  return hasBreakfast || mealValue === 'breakfast' || mealValue === 'all-inclusive';
}

function mapRoomAmenities(amenitiesData: string[]): string[] {
  const amenityLabels: Record<string, string> = {
    'has-wifi': 'Wi-Fi',
    'has-tv': 'Телевизор',
    'has-air-conditioning': 'Кондиционер',
    'has-minibar': 'Мини-бар',
    'has-safe': 'Сейф',
    'has-hairdryer': 'Фен',
    'has-bathtub': 'Ванна',
    'has-shower': 'Душ',
    'has-balcony': 'Балкон',
    'has-kitchen': 'Кухня',
    'has-parking': 'Парковка',
    'has-pool': 'Бассейн',
  };

  return amenitiesData
    .map(a => amenityLabels[a] || a.replace(/^has-/, '').replace(/-/g, ' '))
    .slice(0, 10);
}

function extractCancellationFree(rate: OstrovokHotelpageRate): boolean {
  return rate.cancellation_penalties.free_cancellation_before !== null;
}

export function mapOstrovokRateToRoom(
  rate: OstrovokHotelpageRate,
  hotelId: string,
  roomGroups?: OstrovokRoomGroup[]
): RoomType {
  const totalPrice = rate.daily_prices.reduce(
    (sum, p) => sum + parseFloat(p),
    0
  );
  const nights = rate.daily_prices.length || 1;
  const pricePerNight = Math.round(totalPrice / nights);

  // Try to find matching room group for photos
  const photos: HotelPhoto[] = [];
  if (roomGroups) {
    const matchingGroup = roomGroups.find(
      rg => rg.rg_ext?.class === rate.rg_ext.class && rg.rg_ext?.quality === rate.rg_ext.quality
    );
    if (matchingGroup?.images_ext) {
      photos.push(
        ...matchingGroup.images_ext.map((img, i) => ({
          url: img.url.startsWith('//') ? `https:${img.url}` : img.url,
          alt: `${rate.room_name} — фото ${i + 1}`,
        }))
      );
    }
  }

  return {
    id: `rate-${rate.book_hash}`,
    hotelId,
    name: rate.room_name,
    description: ROOM_CLASS_MAP[rate.rg_ext.class] || rate.room_name,
    area: 0, // Ostrovok API не возвращает площадь номера
    maxGuests: Math.max(rate.rg_ext.capacity, 1),
    bedType: getBedType(rate.rg_ext.capacity),
    pricePerNight,
    photos,
    amenities: mapRoomAmenities(rate.amenities_data || []),
    available: rate.allotment > 0,
    availableCount: rate.allotment,
    cancellationFree: extractCancellationFree(rate),
    breakfastIncluded: mapMealToLabel(rate.meal_data.value, rate.meal_data.has_breakfast),
    bookHash: rate.book_hash,
  };
}

export function mapRatesToRooms(
  rates: OstrovokHotelpageRate[],
  hotelId: string,
  roomGroups?: OstrovokRoomGroup[]
): RoomType[] {
  return rates.map(rate => mapOstrovokRateToRoom(rate, hotelId, roomGroups));
}
