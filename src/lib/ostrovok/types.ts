// ============================================================
// Ostrovok/ETG B2B API v3 — TypeScript types
// ============================================================

// --- Search SERP ---

export interface OstrovokSearchRequest {
  checkin: string;
  checkout: string;
  region_id?: number;
  hids?: number[];
  ids?: string[];
  residency: string;
  guests: OstrovokGuests[];
  currency?: string;
  language?: string;
  hotels_limit?: number;
  timeout?: number;
}

export interface OstrovokGuests {
  adults: number;
  children?: number[];
}

export interface OstrovokSearchResponse {
  total_hotels: number;
  hotels: OstrovokSerpHotel[];
}

export interface OstrovokSerpHotel {
  hid: number;
  id: string;
  rates: OstrovokSerpRate[];
}

export interface OstrovokSerpRate {
  search_hash: string;
  match_hash: string;
  daily_prices: string[];
  meal_data: OstrovokMealData;
  allotment: number;
  room_name: string;
  payment_options: OstrovokPaymentOptions;
  cancellation_penalties: OstrovokCancellationPenalties;
  rg_ext: OstrovokRgExt;
  vat_data?: OstrovokVatData;
  tax_data?: OstrovokTaxData;
  is_package: boolean;
  any_residency: boolean;
  amenities_data?: string[];
}

// --- Hotelpage ---

export interface OstrovokHotelpageRequest {
  checkin: string;
  checkout: string;
  hid?: number;
  id?: string;
  currency?: string;
  language?: string;
  residency: string;
  timeout?: number;
  match_hash?: string;
  guests?: OstrovokGuests[];
}

export interface OstrovokHotelpageResponse {
  data: {
    hotels: OstrovokHotelpageHotel[];
  };
  status: string;
  error: string | null;
}

export interface OstrovokHotelpageHotel {
  hid: number;
  id: string;
  rates: OstrovokHotelpageRate[];
  bar_price_data?: Record<string, unknown>;
}

export interface OstrovokHotelpageRate {
  book_hash: string;
  match_hash: string;
  daily_prices: string[];
  room_name: string;
  allotment: number;
  amenities_data: string[];
  any_residency: boolean;
  is_package: boolean;
  meal_data: OstrovokMealData;
  payment_options: OstrovokPaymentOptions;
  cancellation_penalties: OstrovokCancellationPenalties;
  rg_ext: OstrovokRgExt;
  vat_data?: OstrovokVatData;
  tax_data?: OstrovokTaxData;
  legal_info?: OstrovokLegalInfo;
}

// --- Hotel Info (static content) ---

export interface OstrovokHotelInfoRequest {
  hid?: number;
  id?: string;
  language: string;
}

export interface OstrovokHotelInfoResponse {
  data: OstrovokHotelInfo;
  status: string;
  error: string | null;
}

export interface OstrovokHotelInfo {
  hid: number;
  id: string;
  name: string;
  kind: string;
  address: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  star_rating: number;
  email?: string;
  phone?: string;
  hotel_chain?: string;
  check_in_time?: string;
  check_out_time?: string;
  images: string[];
  images_ext?: OstrovokImageExt[];
  room_groups?: OstrovokRoomGroup[];
  amenity_groups?: OstrovokAmenityGroup[];
  description_struct?: OstrovokDescription[];
  metapolicy_struct?: Record<string, unknown>;
  metapolicy_extra_info?: string;
  region?: OstrovokRegion;
  facts?: OstrovokFacts;
  serp_filters?: string[];
  payment_methods?: string[];
  is_closed?: boolean;
}

export interface OstrovokImageExt {
  url: string;
  category_slug?: string;
}

export interface OstrovokRoomGroup {
  name: string;
  name_struct?: Record<string, string>;
  images_ext?: OstrovokImageExt[];
  room_amenities?: string[];
  room_group_id?: number;
  rg_ext?: OstrovokRgExt;
}

export interface OstrovokAmenityGroup {
  group_name: string;
  amenities: string[];
}

export interface OstrovokDescription {
  title: string;
  paragraphs: string[];
}

export interface OstrovokRegion {
  country_code: string;
  iata?: string;
  name: string;
  type: string;
}

export interface OstrovokFacts {
  floors_count?: number;
  rooms_count?: number;
  year_built?: number;
  year_renovated?: number;
  electricity?: Record<string, unknown>;
}

// --- Multicomplete (autocomplete) ---

export interface OstrovokMulticompleteRequest {
  query: string;
  language?: string;
}

export interface OstrovokMulticompleteResponse {
  hotels: OstrovokMulticompleteHotel[];
  regions: OstrovokMulticompleteRegion[];
}

export interface OstrovokMulticompleteHotel {
  id: string;
  hid: number;
  name: string;
  region_id: number;
}

export interface OstrovokMulticompleteRegion {
  id: string;
  name: string;
  type: string;
  country_code: string;
}

// --- Booking ---

export interface OstrovokBookingFormRequest {
  partner_order_id: string;
  book_hash: string;
  language: string;
  user_ip: string;
}

export interface OstrovokBookingFormResponse {
  data: {
    order_id: number;
    partner_order_id: string;
    item_id: number;
    is_gender_specification_required: boolean;
    upsell_data?: unknown[];
    payment_types: OstrovokPaymentType[];
  };
  status: string;
  error: string | null;
}

export interface OstrovokBookingFinishRequest {
  language: string;
  partner: {
    partner_order_id: string;
    comment?: string;
  };
  payment_type: {
    type: string;
    amount: string;
    currency_code: string;
  };
  rooms: {
    guests: OstrovokBookingGuest[];
  }[];
  user: {
    email: string;
    phone: string;
    comment?: string;
  };
}

export interface OstrovokBookingGuest {
  first_name: string;
  last_name: string;
  is_child?: boolean;
  age?: number;
}

export interface OstrovokBookingFinishResponse {
  status: string;
  data: null;
  error: string | null;
}

export interface OstrovokBookingStatusRequest {
  partner_order_id: string;
}

export interface OstrovokBookingStatusResponse {
  data: {
    partner_order_id: string;
    percent: number;
    data_3ds?: {
      action_url: string;
      method: string;
      data: Record<string, string>;
    } | null;
  };
  status: 'ok' | 'processing' | '3ds' | 'error';
  error: string | null;
}

// --- Shared sub-types ---

export interface OstrovokMealData {
  value: string;
  has_breakfast: boolean;
  no_child_meal?: boolean;
}

export interface OstrovokPaymentOptions {
  payment_types: OstrovokPaymentType[];
}

export interface OstrovokPaymentType {
  type: string; // 'now' | 'deposit' | 'hotel'
  amount: string;
  show_amount: string;
  currency_code: string;
  is_need_credit_card_data?: boolean;
}

export interface OstrovokCancellationPenalties {
  free_cancellation_before: string | null;
  policies: OstrovokCancellationPolicy[];
}

export interface OstrovokCancellationPolicy {
  start_at: string | null;
  end_at: string | null;
  amount_charge: string;
  amount_show?: string;
}

export interface OstrovokRgExt {
  class: number;
  quality: number;
  capacity: number;
}

export interface OstrovokVatData {
  amount: string;
  applied?: boolean;
  included?: boolean;
}

export interface OstrovokTaxData {
  taxes: {
    name: string;
    amount: string;
    currency_code: string;
    included_by_supplier: boolean;
  }[];
}

export interface OstrovokLegalInfo {
  hotel?: {
    name: string;
    address: string;
    taxpayer_number?: string;
  };
  provider?: {
    name: string;
  };
}
