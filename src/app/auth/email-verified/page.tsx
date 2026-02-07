'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-border p-8">
            <XCircle className="h-16 w-16 text-danger mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Ссылка недействительна</h1>
            <p className="text-muted mb-6">
              Ссылка для подтверждения email истекла или уже была использована.
            </p>
            <Link
              href="/profile"
              className="inline-block bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Перейти в профиль
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-border p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Email подтверждён!</h1>
          <p className="text-muted mb-6">
            Спасибо, ваш email успешно подтверждён.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-muted">Загрузка...</div>}>
      <EmailVerifiedContent />
    </Suspense>
  );
}
