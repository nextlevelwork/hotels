'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Globe } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToastStore } from '@/store/toast-store';

export default function RegisterPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Введите имя';
    if (!email.trim() || !email.includes('@')) errs.email = 'Введите корректный email';
    if (password.length < 6) errs.password = 'Пароль должен быть не менее 6 символов';
    if (password !== confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || undefined, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ form: data.error || 'Ошибка регистрации' });
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ form: 'Аккаунт создан, но не удалось войти. Попробуйте войти вручную.' });
      } else {
        addToast('success', 'Добро пожаловать в Гостинец!');
        router.push('/');
        router.refresh();
      }
    } catch {
      setErrors({ form: 'Ошибка при регистрации' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Создать аккаунт</h1>
          <p className="text-muted mt-2">Зарегистрируйтесь для сохранения бронирований и избранного</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 space-y-4">
          {errors.form && (
            <div className="bg-danger/10 text-danger text-sm rounded-lg px-4 py-3">
              {errors.form}
            </div>
          )}

          <Input
            label="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Иванов"
            icon={<User className="h-4 w-4" />}
            error={errors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ivan@mail.ru"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email}
            required
          />

          <Input
            label="Телефон"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 999 123-45-67"
            icon={<Phone className="h-4 w-4" />}
          />

          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password}
            required
          />

          <Input
            label="Подтверждение пароля"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Зарегистрироваться
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
