'use client';

import { useEffect, useState } from 'react';
import { User, Phone, Mail, Lock, Save, Bell } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToastStore } from '@/store/toast-store';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailNotifications: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const addToast = useToastStore((s) => s.add);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setEmailNotifications(data.emailNotifications ?? true);
      })
      .catch(() => {
        addToast('error', 'Ошибка загрузки профиля');
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        addToast('success', 'Профиль обновлён');
      } else {
        const data = await res.json();
        addToast('error', data.error || 'Ошибка сохранения');
      }
    } catch {
      addToast('error', 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotifications = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: newValue }),
      });
      if (res.ok) {
        addToast('success', newValue ? 'Уведомления включены' : 'Уведомления отключены');
      } else {
        setEmailNotifications(!newValue);
        addToast('error', 'Ошибка сохранения');
      }
    } catch {
      setEmailNotifications(!newValue);
      addToast('error', 'Ошибка сохранения');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Новый пароль должен быть не менее 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', 'Пароль изменён');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Ошибка смены пароля');
      }
    } catch {
      setPasswordError('Ошибка при смене пароля');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Профиль</h1>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Личные данные</h2>

        <div className="space-y-4">
          <Input
            label="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="h-4 w-4" />}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <Mail className="h-4 w-4" />
              </div>
              <input
                value={profile?.email || ''}
                readOnly
                className="w-full rounded-lg border border-border bg-gray-50 pl-10 px-4 py-2.5 text-muted cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-muted">Email нельзя изменить</p>
          </div>

          <Input
            label="Телефон"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="h-4 w-4" />}
            placeholder="+7 999 123-45-67"
          />

          <Button onClick={handleSaveProfile} loading={saving}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Уведомления
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Email-уведомления</p>
            <p className="text-xs text-muted mt-0.5">
              Напоминания о заезде и просьбы оставить отзыв
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailNotifications}
            onClick={handleToggleNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emailNotifications ? 'bg-[#2E86AB]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Сменить пароль</h2>

        {passwordError && (
          <div className="bg-danger/10 text-danger text-sm rounded-lg px-4 py-3 mb-4">
            {passwordError}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Текущий пароль"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
          />

          <Input
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            placeholder="Минимум 6 символов"
          />

          <Input
            label="Подтверждение нового пароля"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
          />

          <Button onClick={handleChangePassword} loading={changingPassword} variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Сменить пароль
          </Button>
        </div>
      </div>

      {/* Account Info */}
      {profile?.createdAt && (
        <p className="text-xs text-muted mt-6 text-center">
          Аккаунт создан: {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
        </p>
      )}
    </div>
  );
}
