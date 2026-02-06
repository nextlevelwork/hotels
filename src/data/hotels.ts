import { Hotel } from './types';
import { moscowHotels } from './hotels-moscow';
import { spbHotels } from './hotels-spb';
import { sochiHotels } from './hotels-sochi';
import { kazanHotels } from './hotels-kazan';
import { kaliningradHotels } from './hotels-kaliningrad';

export const allHotels: Hotel[] = [
  ...moscowHotels,
  ...spbHotels,
  ...sochiHotels,
  ...kazanHotels,
  ...kaliningradHotels,
];

export function getHotelBySlug(slug: string): Hotel | undefined {
  return allHotels.find(h => h.slug === slug);
}

export function getHotelById(id: string): Hotel | undefined {
  return allHotels.find(h => h.id === id);
}

export function getHotelsByCity(cityId: string): Hotel[] {
  return allHotels.filter(h => h.cityId === cityId);
}

export { moscowHotels, spbHotels, sochiHotels, kazanHotels, kaliningradHotels };
