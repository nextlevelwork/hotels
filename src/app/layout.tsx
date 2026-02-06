import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: {
    default: 'Гостинец — бронирование отелей по России',
    template: '%s | Гостинец',
  },
  description:
    'Бронируйте отели по России с видеоверификацией, реальными замерами шума и Wi-Fi, ценами без сюрпризов и возможностью торга.',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Гостинец',
    title: 'Гостинец — бронирование отелей по России',
    description: 'Отели с видеоверификацией, замерами шума и Wi-Fi, ценами без сюрпризов',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Гостинец — бронирование отелей по России',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Гостинец — бронирование отелей по России',
    description: 'Отели с видеоверификацией, замерами шума и Wi-Fi, ценами без сюрпризов',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Перейти к содержанию
        </a>
        <Header />
        <main id="main-content" className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
