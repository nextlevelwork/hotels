export interface City {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  hotelsCount: number;
  averagePrice: number;
  coordinates: { lat: number; lng: number };
}

export interface HotelBadge {
  type: 'video-verified' | 'no-surprises' | 'quiet-zone' | 'fast-wifi' | 'workspace' | 'eco' | 'family' | 'business' | 'romantic' | 'pet-friendly' | 'guarantee';
  label: string;
}

export interface NoiseMeasurement {
  level: number; // dB
  rating: 'тихо' | 'умеренно' | 'шумно';
  measuredAt: string;
  details: string;
}

export interface WifiMeasurement {
  speed: number; // Мбит/с
  rating: 'отлично' | 'хорошо' | 'средне' | 'слабо';
  measuredAt: string;
  details: string;
}

export interface RealMeasurements {
  noise: NoiseMeasurement;
  wifi: WifiMeasurement;
  hasWorkspace: boolean;
  workspaceDetails?: string;
  lastVerified: string;
}

export interface HotelPhoto {
  url: string;
  alt: string;
  isMain?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  cityName: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'capsule' | 'glamping' | 'boutique' | 'resort';
  stars?: number;
  rating: number;
  reviewsCount: number;
  address: string;
  coordinates: { lat: number; lng: number };
  description: string;
  shortDescription: string;
  priceFrom: number;
  totalPrice: number;
  photos: HotelPhoto[];
  videoUrl?: string;
  hasVideoVerification: boolean;
  badges: HotelBadge[];
  measurements: RealMeasurements;
  amenities: string[];
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
  bidEnabled: boolean;
  promotions?: HotelPromotion[];
  // Ostrovok integration fields
  ostrovokHid?: number;
  bookHash?: string;
  sourceProvider?: 'mock' | 'ostrovok';
  isVerified?: boolean; // прошёл ли отель верификацию Гостинца
}

export interface HotelPromotion {
  id: string;
  title: string;
  description: string;
  discountPercent?: number;
  validUntil: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  area: number; // м²
  maxGuests: number;
  bedType: string;
  pricePerNight: number;
  originalPrice?: number;
  photos: HotelPhoto[];
  amenities: string[];
  available: boolean;
  availableCount: number;
  cancellationFree: boolean;
  breakfastIncluded: boolean;
  bookHash?: string; // Ostrovok rate identifier for booking
}

export interface Review {
  id: string;
  hotelId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  pros?: string;
  cons?: string;
  travelerType: 'business' | 'couple' | 'family' | 'solo' | 'friends';
  photos?: string[];
  hotelResponse?: string;
}

export interface ReviewSummary {
  hotelId: string;
  averageRating: number;
  totalReviews: number;
  categories: {
    cleanliness: number;
    comfort: number;
    location: number;
    service: number;
    value: number;
  };
  aiSummary: string;
  topPros: string[];
  topCons: string[];
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string;
  hotelIds: string[];
  tag: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'general' | 'room' | 'bathroom' | 'kitchen' | 'entertainment' | 'outdoor' | 'business' | 'safety';
}

export interface SearchFilters {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  stars?: number[];
  types?: string[];
  amenities?: string[];
  noiseMax?: number;
  wifiMin?: number;
  hasWorkspace?: boolean;
  hasVideoVerification?: boolean;
  bidEnabled?: boolean;
  hasGuarantee?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'reviews' | 'distance';
}

export interface SearchResult {
  hotels: Hotel[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BookingGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface BookingState {
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
  promoCode?: string;
  promoDiscount?: number;
  bonusRubles: number;
  paymentMethod: 'card' | 'sbp' | 'cash';
  step: 1 | 2 | 3 | 4;
}

export interface Booking {
  id: string;
  bookingId: string;
  hotel: Pick<Hotel, 'name' | 'slug' | 'address' | 'cityName' | 'photos' | 'checkIn' | 'checkOut' | 'stars'>;
  room: Pick<RoomType, 'name' | 'bedType' | 'area'>;
  guest: BookingGuest;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  paymentMethod: 'card' | 'sbp' | 'cash';
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  cancellationPolicy: string;
}

export interface BidRequest {
  hotelId: string;
  roomId: string;
  proposedPrice: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  comment?: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}
