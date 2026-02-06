import { Amenity } from './types';

export const amenities: Amenity[] = [
  { id: 'wifi', name: 'Wi-Fi', icon: 'Wifi', category: 'general' },
  { id: 'parking', name: 'Парковка', icon: 'Car', category: 'general' },
  { id: 'pool', name: 'Бассейн', icon: 'Waves', category: 'outdoor' },
  { id: 'gym', name: 'Фитнес-центр', icon: 'Dumbbell', category: 'entertainment' },
  { id: 'spa', name: 'Спа', icon: 'Sparkles', category: 'entertainment' },
  { id: 'restaurant', name: 'Ресторан', icon: 'UtensilsCrossed', category: 'general' },
  { id: 'bar', name: 'Бар', icon: 'Wine', category: 'general' },
  { id: 'room-service', name: 'Рум-сервис', icon: 'ConciergeBell', category: 'room' },
  { id: 'ac', name: 'Кондиционер', icon: 'Thermometer', category: 'room' },
  { id: 'tv', name: 'Телевизор', icon: 'Tv', category: 'room' },
  { id: 'minibar', name: 'Мини-бар', icon: 'GlassWater', category: 'room' },
  { id: 'safe', name: 'Сейф', icon: 'Lock', category: 'safety' },
  { id: 'breakfast', name: 'Завтрак включён', icon: 'Coffee', category: 'general' },
  { id: 'transfer', name: 'Трансфер', icon: 'Bus', category: 'general' },
  { id: 'laundry', name: 'Прачечная', icon: 'Shirt', category: 'general' },
  { id: 'concierge', name: 'Консьерж', icon: 'UserCheck', category: 'general' },
  { id: 'kids-club', name: 'Детский клуб', icon: 'Baby', category: 'entertainment' },
  { id: 'pet-friendly', name: 'С животными', icon: 'PawPrint', category: 'general' },
  { id: 'workspace', name: 'Рабочая зона', icon: 'Monitor', category: 'business' },
  { id: 'meeting-room', name: 'Конференц-зал', icon: 'Presentation', category: 'business' },
  { id: 'kitchen', name: 'Кухня', icon: 'ChefHat', category: 'kitchen' },
  { id: 'balcony', name: 'Балкон', icon: 'Fence', category: 'outdoor' },
  { id: 'garden', name: 'Сад', icon: 'TreePine', category: 'outdoor' },
  { id: 'beach', name: 'Пляж', icon: 'Umbrella', category: 'outdoor' },
  { id: 'elevator', name: 'Лифт', icon: 'ArrowUpDown', category: 'general' },
  { id: 'disabled-access', name: 'Доступная среда', icon: 'Accessibility', category: 'general' },
];

export function getAmenityById(id: string): Amenity | undefined {
  return amenities.find(a => a.id === id);
}
