'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const isUnsubscribed = status === 'unsubscribed';
  const isResubscribed = status === 'resubscribed';

  const resubscribeUrl = userId && token
    ? `/api/unsubscribe?userId=${userId}&token=${token}&action=resubscribe`
    : null;

  const unsubscribeUrl = userId && token
    ? `/api/unsubscribe?userId=${userId}&token=${token}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        {isUnsubscribed && (
          <>
            <div className="text-4xl mb-4">📭</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Вы отписались от уведомлений
            </h1>
            <p className="text-gray-600 mb-6">
              Вы больше не будете получать email-уведомления о бронированиях.
              Вы всегда можете включить их обратно в настройках профиля.
            </p>
            {resubscribeUrl && (
              <a
                href={resubscribeUrl}
                className="inline-block bg-[#2E86AB] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#236B88] transition-colors mb-4"
              >
                Вернуть подписку
              </a>
            )}
          </>
        )}

        {isResubscribed && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Подписка восстановлена
            </h1>
            <p className="text-gray-600 mb-6">
              Вы снова будете получать email-уведомления о бронированиях.
            </p>
            {unsubscribeUrl && (
              <a
                href={unsubscribeUrl}
                className="inline-block text-gray-500 underline text-sm mb-4"
              >
                Отписаться снова
              </a>
            )}
          </>
        )}

        {!isUnsubscribed && !isResubscribed && (
          <>
            <div className="text-4xl mb-4">❓</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Неизвестный запрос
            </h1>
            <p className="text-gray-600 mb-6">
              Эта ссылка недействительна или уже использована.
            </p>
          </>
        )}

        <div>
          <Link
            href="/"
            className="text-[#2E86AB] hover:underline text-sm"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
