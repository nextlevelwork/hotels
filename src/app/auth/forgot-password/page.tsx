'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError('Произошла ошибка. Попробуйте позже.');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Восстановление пароля</h1>
          <p className="text-muted mt-2">Введите email, указанный при регистрации</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-border p-6 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Проверьте почту</h2>
            <p className="text-sm text-muted mb-6">
              Если аккаунт с таким email существует, мы отправили письмо со ссылкой для сброса пароля.
            </p>
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline text-sm"
            >
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 space-y-4">
              {error && (
                <div className="bg-danger/10 text-danger text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan@mail.ru"
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Отправить ссылку
              </Button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              <Link href="/auth/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Вернуться ко входу
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
