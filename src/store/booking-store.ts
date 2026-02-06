import { create } from 'zustand';

interface BookingGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

interface BookingStore {
  // State
  hotelSlug: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nightsCount: number;
  pricePerNight: number;
  totalPrice: number;
  guestInfo: BookingGuest;
  promoCode: string;
  promoDiscount: number;
  bonusRubles: number;
  paymentMethod: 'card' | 'sbp' | 'cash';
  step: 1 | 2 | 3 | 4;

  // Actions
  setRoom: (data: { hotelSlug: string; hotelName: string; roomId: string; roomName: string; pricePerNight: number }) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: number) => void;
  setGuestInfo: (info: Partial<BookingGuest>) => void;
  setPaymentMethod: (method: 'card' | 'sbp' | 'cash') => void;
  setPromoCode: (code: string, discount: number) => void;
  setBonusRubles: (amount: number) => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  calculateTotal: () => void;
}

const initialState = {
  hotelSlug: '',
  hotelName: '',
  roomId: '',
  roomName: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  nightsCount: 1,
  pricePerNight: 0,
  totalPrice: 0,
  guestInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  },
  promoCode: '',
  promoDiscount: 0,
  bonusRubles: 0,
  paymentMethod: 'card' as const,
  step: 1 as const,
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  setRoom: (data) => {
    set({
      hotelSlug: data.hotelSlug,
      hotelName: data.hotelName,
      roomId: data.roomId,
      roomName: data.roomName,
      pricePerNight: data.pricePerNight,
    });
    get().calculateTotal();
  },

  setDates: (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    set({ checkIn, checkOut, nightsCount: nights });
    get().calculateTotal();
  },

  setGuests: (guests) => set({ guests }),

  setGuestInfo: (info) =>
    set((state) => ({
      guestInfo: { ...state.guestInfo, ...info },
    })),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setPromoCode: (code, discount) => {
    set({ promoCode: code, promoDiscount: discount });
    get().calculateTotal();
  },

  setBonusRubles: (amount) => {
    set({ bonusRubles: amount });
    get().calculateTotal();
  },

  setStep: (step) => set({ step }),

  nextStep: () =>
    set((state) => ({
      step: Math.min(4, state.step + 1) as 1 | 2 | 3 | 4,
    })),

  prevStep: () =>
    set((state) => ({
      step: Math.max(1, state.step - 1) as 1 | 2 | 3 | 4,
    })),

  reset: () => set(initialState),

  calculateTotal: () => {
    const state = get();
    const subtotal = state.pricePerNight * state.nightsCount;
    const promoAmount = state.promoDiscount > 0 ? Math.round(subtotal * (state.promoDiscount / 100)) : 0;
    const total = Math.max(0, subtotal - promoAmount - state.bonusRubles);
    set({ totalPrice: total });
  },
}));
