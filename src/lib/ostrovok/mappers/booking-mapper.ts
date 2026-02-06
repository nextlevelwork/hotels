import type { Booking, Hotel, RoomType } from '@/data/types';
import { generateBookingId } from '@/lib/utils';

interface BookingContext {
  hotel: Hotel;
  room: RoomType;
  partnerOrderId: string;
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
  totalPrice: number;
  discount?: number;
}

export function mapToBooking(ctx: BookingContext): Booking {
  const checkIn = new Date(ctx.checkIn);
  const checkOut = new Date(ctx.checkOut);
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    id: ctx.partnerOrderId,
    bookingId: generateBookingId(),
    hotel: {
      name: ctx.hotel.name,
      slug: ctx.hotel.slug,
      address: ctx.hotel.address,
      cityName: ctx.hotel.cityName,
      photos: ctx.hotel.photos,
      checkIn: ctx.hotel.checkIn,
      checkOut: ctx.hotel.checkOut,
      stars: ctx.hotel.stars,
    },
    room: {
      name: ctx.room.name,
      bedType: ctx.room.bedType,
      area: ctx.room.area,
    },
    guest: ctx.guestInfo,
    checkIn: ctx.checkIn,
    checkOut: ctx.checkOut,
    nights,
    guests: ctx.guests,
    pricePerNight: ctx.room.pricePerNight,
    totalPrice: ctx.totalPrice,
    discount: ctx.discount ?? 0,
    finalPrice: ctx.totalPrice - (ctx.discount ?? 0),
    paymentMethod: ctx.paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString(),
    cancellationPolicy: ctx.hotel.cancellationPolicy,
  };
}
