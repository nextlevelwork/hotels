# Гостинец

Сервис бронирования отелей по России с видеоверификацией, реальными замерами шума и Wi-Fi, ценами без сюрпризов и возможностью торга.

**Демо-проект** — 50 отелей по 5 городам (Москва, Санкт-Петербург, Сочи, Казань, Калининград).

## Стек

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Zustand** — стейт (бронирование, избранное, тосты)
- **Framer Motion** — анимации
- **Swiper** — карусели и галереи
- **Zod + React Hook Form** — валидация форм
- **Ostrovok/ETG B2B API** — провайдер реальных отелей (опционально)

## Возможности

- Поиск и фильтрация отелей (цена, звёзды, тип, шум, Wi-Fi, workspace)
- Карточки отелей с реальными замерами (шум в дБ, Wi-Fi в Мбит/с)
- Видеоверификация и фотогалерея с лайтбоксом
- AI-суммаризация отзывов с категориями и pros/cons
- Сортировка отзывов по дате и рейтингу
- Система торга — предложи свою цену
- Полный booking flow (выбор номера → данные гостя → оплата → ваучер)
- Избранное с persist в localStorage
- Кнопка «Поделиться» (Web Share API / clipboard)
- Toast-уведомления
- Информационные страницы (О сервисе, FAQ, Контакты, Политика, Условия)
- SEO: метаданные, canonical, Open Graph, JSON-LD, sitemap, robots
- Адаптивный дизайн (mobile-first)
- Error boundaries, not-found страница

## Запуск

```bash
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

### Ostrovok API (опционально)

Создайте `.env.local`:

```env
OSTROVOK_API_KEY=your_key
OSTROVOK_API_MODE=ostrovok
```

Без ключа сервис работает на моковых данных (50 отелей).

## Структура

```
src/
├── app/                    # Страницы (App Router)
│   ├── about/              # О сервисе
│   ├── booking/[hotelSlug] # Бронирование
│   ├── confirmation/       # Подтверждение
│   ├── contact/            # Контакты
│   ├── faq/                # FAQ
│   ├── favorites/          # Избранное
│   ├── hotel/[slug]/       # Страница отеля
│   ├── privacy/            # Конфиденциальность
│   ├── search/             # Поиск
│   ├── terms/              # Условия
│   └── api/ostrovok/       # API routes (Ostrovok proxy)
├── components/
│   ├── home/               # Секции главной
│   ├── hotel/              # Компоненты отеля
│   ├── layout/             # Header, Footer, MobileNav
│   ├── search/             # Поиск и карточки
│   └── ui/                 # UI-kit (Modal, Badge, Toast, etc.)
├── data/                   # Моковые данные (50 отелей, отзывы, номера)
├── lib/                    # Утилиты, API, форматирование
└── store/                  # Zustand stores
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер (Turbopack) |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production |
| `npm run lint` | ESLint |
