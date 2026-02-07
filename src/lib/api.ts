import { allHotels, getHotelBySlug } from '@/data/hotels';
import { getRoomsByHotelId, getRoomById } from '@/data/rooms';
import { getReviewsByHotelId, getReviewSummary } from '@/data/reviews';
import { collections } from '@/data/collections';
import { cities } from '@/data/cities';
import type {
  Hotel,
  RoomType,
  Review,
  ReviewSummary,
  SearchFilters,
  SearchResult,
  Booking,
  BidRequest,
  Collection,
  City,
  PriceHistoryPoint,
} from '@/data/types';
import { generateBookingId } from './utils';
import { getApiMode } from './ostrovok/config';
import {
  ostrovokSearchHotels,
  ostrovokGetHotelByHid,
} from './ostrovok-provider';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock implementations (existing) ---

async function mockSearchHotels(
  filters: SearchFilters,
  page = 1,
  pageSize = 10
): Promise<SearchResult> {
  await delay(300);

  let filtered = [...allHotels];

  if (filters.city) {
    const cityLower = filters.city.toLowerCase();
    filtered = filtered.filter(
      h =>
        h.cityName.toLowerCase().includes(cityLower) ||
        h.cityId.toLowerCase().includes(cityLower)
    );
  }

  if (filters.priceMin !== undefined) {
    filtered = filtered.filter(h => h.priceFrom >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter(h => h.priceFrom <= filters.priceMax!);
  }

  if (filters.stars && filters.stars.length > 0) {
    filtered = filtered.filter(h => h.stars && filters.stars!.includes(h.stars));
  }

  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(h => filters.types!.includes(h.type));
  }

  if (filters.noiseMax !== undefined) {
    filtered = filtered.filter(h => h.measurements.noise.level <= filters.noiseMax!);
  }

  if (filters.wifiMin !== undefined) {
    filtered = filtered.filter(h => h.measurements.wifi.speed >= filters.wifiMin!);
  }

  if (filters.hasWorkspace) {
    filtered = filtered.filter(h => h.measurements.hasWorkspace);
  }

  if (filters.hasVideoVerification) {
    filtered = filtered.filter(h => h.hasVideoVerification);
  }

  if (filters.bidEnabled) {
    filtered = filtered.filter(h => h.bidEnabled);
  }

  if (filters.hasGuarantee) {
    filtered = filtered.filter(h => h.badges.some(b => b.type === 'guarantee'));
  }

  if (filters.amenities && filters.amenities.length > 0) {
    filtered = filtered.filter(h =>
      filters.amenities!.every(a => h.amenities.includes(a))
    );
  }

  // Sort
  switch (filters.sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.priceFrom - b.priceFrom);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.priceFrom - a.priceFrom);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'reviews':
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    default:
      filtered.sort((a, b) => b.rating - a.rating);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const hotels = filtered.slice(start, start + pageSize);

  return {
    hotels,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

async function mockGetHotel(slug: string): Promise<Hotel | null> {
  await delay(200);
  return getHotelBySlug(slug) ?? null;
}

async function mockGetHotelRooms(hotelId: string): Promise<RoomType[]> {
  await delay(200);
  return getRoomsByHotelId(hotelId);
}

// --- Provider switching ---

export async function searchHotels(
  filters: SearchFilters,
  page = 1,
  pageSize = 10
): Promise<SearchResult> {
  if (getApiMode() === 'ostrovok') {
    return ostrovokSearchHotels(filters, page, pageSize);
  }
  return mockSearchHotels(filters, page, pageSize);
}

export async function getHotel(slug: string): Promise<Hotel | null> {
  if (getApiMode() === 'ostrovok') {
    // For ostrovok hotels, try mock first (for enriched/verified hotels)
    // Then fall back to API
    const mockHotel = getHotelBySlug(slug);
    if (mockHotel) return mockHotel;
    // Ostrovok hotels are resolved by hid in the page component
    return null;
  }
  return mockGetHotel(slug);
}

export async function getHotelByHid(
  hid: number,
  checkin?: string,
  checkout?: string
): Promise<{ hotel: Hotel; rooms: RoomType[] } | null> {
  return ostrovokGetHotelByHid(hid, checkin, checkout);
}

export async function getHotelRooms(hotelId: string): Promise<RoomType[]> {
  if (getApiMode() === 'ostrovok' && hotelId.startsWith('ostrovok-')) {
    // Rooms are fetched together with hotel in getHotelByHid
    return [];
  }
  return mockGetHotelRooms(hotelId);
}

export async function getRoom(roomId: string): Promise<RoomType | null> {
  await delay(100);
  return getRoomById(roomId) ?? null;
}

export async function getHotelReviews(
  hotelId: string,
  travelerType?: string
): Promise<Review[]> {
  await delay(200);
  // For Ostrovok hotels, we don't have reviews yet
  if (hotelId.startsWith('ostrovok-')) return [];
  let result = getReviewsByHotelId(hotelId);
  if (travelerType) {
    result = result.filter(r => r.travelerType === travelerType);
  }
  return result;
}

export async function getHotelReviewSummary(
  hotelId: string
): Promise<ReviewSummary | null> {
  await delay(100);
  if (hotelId.startsWith('ostrovok-')) return null;
  return getReviewSummary(hotelId) ?? null;
}

export async function getCities(): Promise<City[]> {
  await delay(100);
  return cities;
}

export async function getCollections(): Promise<Collection[]> {
  await delay(150);
  return collections;
}

export async function getCollectionHotels(collectionId: string): Promise<Hotel[]> {
  await delay(200);
  const collection = collections.find(c => c.id === collectionId);
  if (!collection) return [];
  return allHotels.filter(h => collection.hotelIds.includes(h.id));
}

export async function createBooking(data: {
  hotelSlug: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentMethod: 'card' | 'sbp' | 'cash';
  promoCode?: string;
  bonusRubles?: number;
}): Promise<Booking> {
  await delay(500);

  const hotel = getHotelBySlug(data.hotelSlug);
  if (!hotel) throw new Error('Hotel not found');

  const room = getRoomById(data.roomId);
  if (!room) throw new Error('Room not found');

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );

  const subtotal = room.pricePerNight * nights;
  const discount = data.bonusRubles ?? 0;
  const promoDiscount = data.promoCode === 'ГОСТИНЕЦ10' ? Math.round(subtotal * 0.1) : 0;
  const finalPrice = subtotal - discount - promoDiscount;

  return {
    id: `booking-${Date.now()}`,
    bookingId: generateBookingId(),
    hotel: {
      name: hotel.name,
      slug: hotel.slug,
      address: hotel.address,
      cityName: hotel.cityName,
      photos: hotel.photos,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      stars: hotel.stars,
    },
    room: {
      name: room.name,
      bedType: room.bedType,
      area: room.area,
    },
    guest: data.guestInfo,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    nights,
    guests: data.guests,
    pricePerNight: room.pricePerNight,
    totalPrice: subtotal,
    discount: discount + promoDiscount,
    finalPrice,
    bonusSpent: discount,
    paymentMethod: data.paymentMethod,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    cancellationPolicy: hotel.cancellationPolicy,
  };
}

export async function submitBid(bid: BidRequest): Promise<{ accepted: boolean; message: string }> {
  await delay(800);
  const hotel = allHotels.find(h => h.id === bid.hotelId);
  if (!hotel) return { accepted: false, message: 'Отель не найден' };

  const minAcceptable = hotel.priceFrom * 0.75;
  if (bid.proposedPrice >= minAcceptable) {
    return {
      accepted: true,
      message: `Ваше предложение ${bid.proposedPrice} ₽ принято! Вы сэкономили ${hotel.priceFrom - bid.proposedPrice} ₽`,
    };
  }
  return {
    accepted: false,
    message: `К сожалению, ${bid.proposedPrice} ₽ слишком низкая цена. Попробуйте предложить от ${Math.round(minAcceptable)} ₽`,
  };
}

export async function validatePromoCode(
  code: string
): Promise<{ valid: boolean; discount: number; description: string }> {
  await delay(300);
  const promos: Record<string, { discount: number; description: string }> = {
    'ГОСТИНЕЦ10': { discount: 10, description: 'Скидка 10% на первое бронирование' },
    'ЛЕТО2025': { discount: 15, description: 'Летняя скидка 15%' },
    'WELCOME': { discount: 5, description: 'Приветственная скидка 5%' },
  };
  const promo = promos[code.toUpperCase()];
  if (promo) return { valid: true, ...promo };
  return { valid: false, discount: 0, description: 'Промокод не найден' };
}

export async function getPriceHistory(hotelId: string): Promise<PriceHistoryPoint[]> {
  await delay(200);
  const hotel = allHotels.find(h => h.id === hotelId);
  if (!hotel) return [];

  const basePrice = hotel.priceFrom;
  const points: PriceHistoryPoint[] = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variation = 0.85 + Math.random() * 0.3;
    points.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(basePrice * variation),
    });
  }
  return points;
}

// --- Ostrovok booking orchestration ---

async function ostrovokPrebook(bookHash: string): Promise<{
  partnerOrderId: string;
  paymentTypes: { type: string; amount: string; currencyCode: string }[];
}> {
  const res = await fetch('/api/ostrovok/prebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_hash: bookHash }),
  });
  if (!res.ok) throw new Error('Prebook failed');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return {
    partnerOrderId: json.data.partner_order_id,
    paymentTypes: json.data.payment_types.map((pt: { type: string; amount: string; currency_code: string }) => ({
      type: pt.type,
      amount: pt.amount,
      currencyCode: pt.currency_code,
    })),
  };
}

async function ostrovokStartBooking(data: {
  partnerOrderId: string;
  paymentType: string;
  amount: string;
  currencyCode: string;
  guests: { firstName: string; lastName: string }[];
  email: string;
  phone: string;
  comment?: string;
}): Promise<void> {
  const res = await fetch('/api/ostrovok/booking/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerOrderId: data.partnerOrderId,
      paymentType: data.paymentType,
      amount: data.amount,
      currencyCode: data.currencyCode,
      guests: data.guests,
      email: data.email,
      phone: data.phone,
      comment: data.comment,
    }),
  });
  if (!res.ok) throw new Error('Booking start failed');
  const json = await res.json();
  if (json.error) throw new Error(json.error);
}

async function ostrovokCheckBookingStatus(partnerOrderId: string): Promise<{
  status: 'ok' | 'processing' | '3ds' | 'error';
  percent: number;
}> {
  const res = await fetch(`/api/ostrovok/booking/status?partner_order_id=${encodeURIComponent(partnerOrderId)}`);
  if (!res.ok) throw new Error('Status check failed');
  const json = await res.json();
  return { status: json.status, percent: json.data?.percent ?? 0 };
}

export async function createOstrovokBooking(data: {
  bookHash: string;
  hotelName: string;
  hotelSlug: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  pricePerNight: number;
  totalPrice: number;
  onProgress?: (status: string, percent: number) => void;
}): Promise<Booking> {
  // Step 1: Prebook
  data.onProgress?.('Проверяем доступность...', 10);
  const prebook = await ostrovokPrebook(data.bookHash);

  // Step 2: Start booking
  data.onProgress?.('Создаём бронирование...', 40);
  const paymentType = prebook.paymentTypes[0];
  if (!paymentType) throw new Error('No payment types available');

  await ostrovokStartBooking({
    partnerOrderId: prebook.partnerOrderId,
    paymentType: paymentType.type,
    amount: paymentType.amount,
    currencyCode: paymentType.currencyCode,
    guests: [{ firstName: data.guestInfo.firstName, lastName: data.guestInfo.lastName }],
    email: data.guestInfo.email,
    phone: data.guestInfo.phone,
    comment: data.guestInfo.specialRequests,
  });

  // Step 3: Poll status
  data.onProgress?.('Ожидаем подтверждение...', 60);
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    await delay(2000);
    const statusResult = await ostrovokCheckBookingStatus(prebook.partnerOrderId);
    data.onProgress?.('Ожидаем подтверждение...', 60 + Math.min(35, statusResult.percent * 0.35));

    if (statusResult.status === 'ok') {
      data.onProgress?.('Бронирование подтверждено!', 100);

      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: `ostrovok-${prebook.partnerOrderId}`,
        bookingId: prebook.partnerOrderId.split('-')[0].toUpperCase(),
        hotel: {
          name: data.hotelName,
          slug: data.hotelSlug,
          address: '',
          cityName: '',
          photos: [],
          checkIn: '14:00',
          checkOut: '12:00',
        },
        room: { name: data.roomName, bedType: '', area: 0 },
        guest: data.guestInfo,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        nights,
        guests: data.guests,
        pricePerNight: data.pricePerNight,
        totalPrice: data.totalPrice,
        discount: 0,
        finalPrice: data.totalPrice,
        paymentMethod: 'card',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        cancellationPolicy: 'Согласно условиям тарифа',
      };
    }

    if (statusResult.status === 'error') {
      throw new Error('Бронирование отклонено поставщиком');
    }
  }

  throw new Error('Время ожидания подтверждения истекло');
}

export async function getPopularHotels(): Promise<Hotel[]> {
  await delay(150);
  return [...allHotels].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 6);
}

export async function getSimilarHotels(hotelId: string): Promise<Hotel[]> {
  await delay(200);
  const hotel = allHotels.find(h => h.id === hotelId);
  if (!hotel) return [];
  return allHotels
    .filter(h => h.id !== hotelId && h.cityId === hotel.cityId)
    .sort((a, b) => Math.abs(a.priceFrom - hotel.priceFrom) - Math.abs(b.priceFrom - hotel.priceFrom))
    .slice(0, 4);
}
