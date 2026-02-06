import type {
  Hotel,
  RoomType,
  SearchFilters,
  SearchResult,
} from '@/data/types';
import type {
  OstrovokSearchResponse,
  OstrovokHotelpageResponse,
  OstrovokHotelInfoResponse,
  OstrovokMulticompleteResponse,
  OstrovokBookingFormResponse,
  OstrovokBookingFinishResponse,
  OstrovokBookingStatusResponse,
} from './ostrovok/types';
import { mapSerpHotelToHotel } from './ostrovok/mappers/search-mapper';
import { mapOstrovokHotelToHotel } from './ostrovok/mappers/hotel-mapper';
import { mapRatesToRooms } from './ostrovok/mappers/room-mapper';
import { getRegionId } from '@/data/region-map';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function ostrovokSearchHotels(
  filters: SearchFilters,
  page = 1,
  pageSize = 10
): Promise<SearchResult> {
  const regionId = filters.city ? getRegionId(filters.city) : undefined;
  if (!regionId) {
    return { hotels: [], total: 0, page, pageSize, hasMore: false };
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const checkin = filters.checkIn || tomorrow.toISOString().split('T')[0];
  const checkout = filters.checkOut || dayAfter.toISOString().split('T')[0];

  const serpData = await apiFetch<OstrovokSearchResponse>('/api/ostrovok/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      checkin,
      checkout,
      region_id: regionId,
      guests: [{ adults: filters.guests || 2 }],
    }),
  });

  // Fetch hotel info for each hotel to get names, photos, etc.
  // In production, this should be cached/pre-loaded from dump
  const hotelInfoPromises = serpData.hotels.map(async (h) => {
    try {
      const infoRes = await apiFetch<OstrovokHotelInfoResponse>(
        `/api/ostrovok/hotel/${h.hid}`
      );
      return { hid: h.hid, info: infoRes.data };
    } catch {
      return { hid: h.hid, info: undefined };
    }
  });

  const hotelInfos = await Promise.all(hotelInfoPromises);
  const infoMap = new Map(
    hotelInfos.filter(h => h.info).map(h => [h.hid, h.info!])
  );

  // Map search results to our Hotel type
  const { getCityById } = await import('@/data/cities');
  const cityId = filters.city || 'unknown';
  const city = getCityById(cityId);

  let hotels: Hotel[] = serpData.hotels.map(serpHotel =>
    mapSerpHotelToHotel(serpHotel, infoMap.get(serpHotel.hid), cityId, city?.name)
  );

  // Apply client-side filters that Ostrovok doesn't support
  if (filters.priceMin !== undefined) {
    hotels = hotels.filter(h => h.priceFrom >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    hotels = hotels.filter(h => h.priceFrom <= filters.priceMax!);
  }
  if (filters.stars && filters.stars.length > 0) {
    hotels = hotels.filter(h => h.stars && filters.stars!.includes(h.stars));
  }
  if (filters.hasVideoVerification) {
    hotels = hotels.filter(h => h.hasVideoVerification);
  }
  if (filters.bidEnabled) {
    hotels = hotels.filter(h => h.bidEnabled);
  }

  // Sort
  switch (filters.sortBy) {
    case 'price-asc':
      hotels.sort((a, b) => a.priceFrom - b.priceFrom);
      break;
    case 'price-desc':
      hotels.sort((a, b) => b.priceFrom - a.priceFrom);
      break;
    case 'rating':
      hotels.sort((a, b) => b.rating - a.rating);
      break;
    case 'reviews':
      hotels.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    default:
      hotels.sort((a, b) => a.priceFrom - b.priceFrom);
  }

  const total = hotels.length;
  const start = (page - 1) * pageSize;
  const paged = hotels.slice(start, start + pageSize);

  return {
    hotels: paged,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

export async function ostrovokGetHotel(slug: string): Promise<Hotel | null> {
  // For Ostrovok hotels, slug contains the hid after "ostrovok-"
  // But since we generate slugs from names, we need to find by hid
  // The caller should pass the hid if available
  return null; // Implemented via ostrovokGetHotelByHid
}

export async function ostrovokGetHotelByHid(
  hid: number,
  checkin?: string,
  checkout?: string
): Promise<{ hotel: Hotel; rooms: RoomType[] } | null> {
  try {
    // Fetch static info
    const infoRes = await apiFetch<OstrovokHotelInfoResponse>(
      `/api/ostrovok/hotel/${hid}`
    );

    if (infoRes.error) return null;

    // Fetch rates if dates provided
    let rates: OstrovokHotelpageResponse['data']['hotels'][0]['rates'] = [];
    if (checkin && checkout) {
      try {
        const ratesRes = await apiFetch<OstrovokHotelpageResponse>(
          `/api/ostrovok/hotel/${hid}/rates`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkin, checkout }),
          }
        );
        if (ratesRes.data?.hotels?.[0]?.rates) {
          rates = ratesRes.data.hotels[0].rates;
        }
      } catch (e) {
        console.warn('Failed to fetch rates:', e);
      }
    }

    const hotel = mapOstrovokHotelToHotel(infoRes.data, rates);
    const rooms = mapRatesToRooms(rates, hotel.id, infoRes.data.room_groups);

    return { hotel, rooms };
  } catch (error) {
    console.error('Failed to get hotel by hid:', error);
    return null;
  }
}

export async function ostrovokAutocomplete(
  query: string
): Promise<OstrovokMulticompleteResponse> {
  return apiFetch<OstrovokMulticompleteResponse>('/api/ostrovok/autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
}

export async function ostrovokPrebook(bookHash: string): Promise<OstrovokBookingFormResponse> {
  return apiFetch<OstrovokBookingFormResponse>('/api/ostrovok/prebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_hash: bookHash }),
  });
}

export async function ostrovokStartBooking(data: {
  partnerOrderId: string;
  paymentType: string;
  amount: string;
  currencyCode: string;
  guests: { firstName: string; lastName: string }[];
  email: string;
  phone: string;
  comment?: string;
}): Promise<OstrovokBookingFinishResponse> {
  return apiFetch<OstrovokBookingFinishResponse>('/api/ostrovok/booking/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function ostrovokCheckBookingStatus(
  partnerOrderId: string
): Promise<OstrovokBookingStatusResponse> {
  return apiFetch<OstrovokBookingStatusResponse>(
    `/api/ostrovok/booking/status?partner_order_id=${encodeURIComponent(partnerOrderId)}`
  );
}
