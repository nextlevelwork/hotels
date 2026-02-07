'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Произошла ошибка');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-border p-6">
            <p className="text-muted mb-4">Недействительная ссылка сброса пароля.</p>
            <Link href="/auth/forgot-password" className="text-primary font-medium hover:underline">
              Запросить новую ссылку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Новый пароль</h1>
          <p className="text-muted mt-2">Придумайте новый пароль для вашего аккаунта</p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-border p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Пароль изменён</h2>
            <p className="text-sm text-muted mb-6">
              Теперь вы можете войти с новым паролем.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Войти
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 space-y-4">
            {error && (
              <div className="bg-danger/10 text-danger text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Input
              label="Новый пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              icon={<Lock className="h-4 w-4" />}
              required
            />

            <Input
              label="Подтверждение пароля"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              icon={<Lock className="h-4 w-4" />}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Сохранить пароль
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-muted">Загрузка...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
