import { Collection } from './types';

export const collections: Collection[] = [
  {
    id: 'col-1',
    title: 'Романтический уикенд',
    description: 'Лучшие отели для пар: бутик-отели, спа, панорамные виды',
    slug: 'romantic-weekend',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&h=450&fit=crop',
    hotelIds: ['msk-5', 'msk-9', 'msk-12', 'spb-1', 'spb-2', 'klg-1', 'klg-8', 'kzn-3', 'kzn-5'],
    tag: 'Романтика',
  },
  {
    id: 'col-2',
    title: 'С детьми на каникулы',
    description: 'Семейные отели с детскими клубами, аквапарками и анимацией',
    slug: 'family-vacation',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=450&fit=crop',
    hotelIds: ['msk-8', 'sochi-2', 'sochi-5', 'sochi-10', 'kzn-1'],
    tag: 'Семья',
  },
  {
    id: 'col-3',
    title: 'Для цифровых кочевников',
    description: 'Отели с быстрым Wi-Fi, коворкингами и удобными рабочими местами',
    slug: 'digital-nomads',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop',
    hotelIds: ['msk-2', 'msk-4', 'msk-6', 'msk-10', 'spb-4', 'spb-10', 'klg-7'],
    tag: 'Работа',
  },
  {
    id: 'col-4',
    title: 'Бюджетно и стильно',
    description: 'Хостелы и бюджетные отели с отличным рейтингом и дизайном',
    slug: 'budget-stylish',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=450&fit=crop',
    hotelIds: ['msk-4', 'msk-6', 'spb-4', 'spb-11', 'sochi-8', 'kzn-7', 'klg-7'],
    tag: 'Бюджет',
  },
  {
    id: 'col-5',
    title: 'Роскошь 5 звёзд',
    description: 'Лучшие пятизвёздочные отели России с безупречным сервисом',
    slug: 'luxury-five-stars',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop',
    hotelIds: ['msk-1', 'msk-5', 'msk-7', 'spb-1', 'spb-5', 'spb-7', 'sochi-1', 'sochi-5', 'sochi-7', 'sochi-9'],
    tag: 'Люкс',
  },
  {
    id: 'col-6',
    title: 'Необычные ночёвки',
    description: 'Капсульные отели, глэмпинги и другие необычные варианты',
    slug: 'unusual-stays',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=450&fit=crop',
    hotelIds: ['msk-4', 'sochi-4', 'sochi-6', 'klg-8'],
    tag: 'Необычные',
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}
