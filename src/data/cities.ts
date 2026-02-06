import { City } from './types';

export const cities: City[] = [
  {
    id: 'moscow',
    name: 'Москва',
    slug: 'moskva',
    description: 'Столица России — деловой и культурный центр с тысячами отелей на любой вкус',
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&h=1000&fit=crop',
    hotelsCount: 12,
    averagePrice: 5500,
    coordinates: { lat: 55.7558, lng: 37.6173 },
  },
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    slug: 'sankt-peterburg',
    description: 'Культурная столица с белыми ночами, дворцами и каналами',
    image: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800&h=1000&fit=crop',
    hotelsCount: 12,
    averagePrice: 4800,
    coordinates: { lat: 59.9343, lng: 30.3351 },
  },
  {
    id: 'sochi',
    name: 'Сочи',
    slug: 'sochi',
    description: 'Главный курорт России — море, горы и развлечения круглый год',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&h=1000&fit=crop',
    hotelsCount: 10,
    averagePrice: 6200,
    coordinates: { lat: 43.5992, lng: 39.7257 },
  },
  {
    id: 'kazan',
    name: 'Казань',
    slug: 'kazan',
    description: 'Третья столица России — уникальное сочетание восточной и европейской культур',
    image: 'https://images.unsplash.com/photo-1623949444573-4097d0e42b5e?w=800&h=1000&fit=crop',
    hotelsCount: 8,
    averagePrice: 3800,
    coordinates: { lat: 55.7887, lng: 49.1221 },
  },
  {
    id: 'kaliningrad',
    name: 'Калининград',
    slug: 'kaliningrad',
    description: 'Самый европейский город России с янтарным побережьем и немецкой архитектурой',
    image: 'https://images.unsplash.com/photo-1609942072796-a1e1fae024c9?w=800&h=1000&fit=crop',
    hotelsCount: 8,
    averagePrice: 3500,
    coordinates: { lat: 54.7104, lng: 20.4522 },
  },
];

export function getCityById(id: string): City | undefined {
  return cities.find(c => c.id === id);
}

export function getCityBySlug(slug: string): City | undefined {
  return cities.find(c => c.slug === slug);
}
