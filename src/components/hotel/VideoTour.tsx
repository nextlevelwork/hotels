'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Hotel } from '@/data/types';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

interface VideoTourProps {
  hotel: Hotel;
}

export default function VideoTour({ hotel }: VideoTourProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const mainSwiperRef = useRef<SwiperType | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative rounded-2xl overflow-hidden bg-gray-100">
        {/* Main Carousel / Video */}
        <div className="relative aspect-[21/9] sm:aspect-[21/8]">
          {showVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center text-white">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-medium">Видеотур по отелю</p>
                <p className="text-sm text-white/60 mt-1">Видео будет доступно при подключении к реальному API</p>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-white transition-colors cursor-pointer z-20"
                aria-label="Закрыть видео"
              >
                <X className="h-4 w-4" />
                Закрыть
              </button>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Thumbs, Keyboard, A11y]}
              navigation
              pagination={{ clickable: true }}
              keyboard={{ enabled: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              onSwiper={(swiper) => { mainSwiperRef.current = swiper; }}
              loop={hotel.photos.length > 1}
              className="h-full hotel-gallery-swiper"
              a11y={{
                prevSlideMessage: 'Предыдущее фото',
                nextSlideMessage: 'Следующее фото',
                paginationBulletMessage: 'Перейти к фото {{index}}',
              }}
            >
              {hotel.photos.map((photo, i) => (
                <SwiperSlide key={i}>
                  <div className="relative w-full h-full cursor-zoom-in" onClick={() => openLightbox(i)}>
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Video Button */}
          {hotel.hasVideoVerification && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black/80 transition-colors backdrop-blur-sm cursor-pointer"
            >
              <Play className="h-5 w-5" />
              Смотреть видеотур
            </button>
          )}
        </div>

        {/* Thumbnails Swiper */}
        {!showVideo && hotel.photos.length > 1 && (
          <div className="p-3">
            <Swiper
              modules={[Thumbs, A11y]}
              onSwiper={setThumbsSwiper}
              slidesPerView="auto"
              spaceBetween={8}
              watchSlidesProgress
              className="thumbs-swiper"
            >
              {hotel.photos.map((photo, i) => (
                <SwiperSlide key={i} className="!w-20">
                  <div className="relative w-20 h-14">
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes="80px"
                      className="rounded-lg object-cover cursor-pointer transition-opacity hover:opacity-100"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <LightboxModal
            photos={hotel.photos}
            startIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LightboxModal({
  photos,
  startIndex,
  onClose,
}: {
  photos: { url: string; alt: string }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % photos.length);
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, photos.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
        aria-label="Закрыть"
      >
        <X className="h-6 w-6" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photos.length) % photos.length); }}
            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photos.length); }}
            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Следующее фото"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full max-w-5xl max-h-[80vh] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[current].url}
          alt={photos[current].alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {current + 1} / {photos.length}
      </div>
    </motion.div>
  );
}
