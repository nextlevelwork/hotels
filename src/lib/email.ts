import nodemailer from 'nodemailer';
import crypto from 'crypto';
import type { Booking } from '@prisma/client';
import { formatPriceShort, pluralize } from './utils';

const globalForMailer = globalThis as unknown as {
  mailer: nodemailer.Transporter | undefined;
};

function getTransporter() {
  if (globalForMailer.mailer) return globalForMailer.mailer;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  if (process.env.NODE_ENV !== 'production') globalForMailer.mailer = transporter;

  return transporter;
}

const paymentLabels: Record<string, string> = {
  card: 'Банковская карта',
  sbp: 'СБП',
  cash: 'При заселении',
};

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://gostinets.ru';
}

// --- Unsubscribe helpers ---

export function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.EMAIL_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret';
  return crypto.createHmac('sha256', secret).update(userId).digest('hex');
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = generateUnsubscribeToken(userId);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function generateUnsubscribeUrl(userId: string): string {
  const token = generateUnsubscribeToken(userId);
  return `${getBaseUrl()}/api/unsubscribe?userId=${userId}&token=${token}`;
}

// --- Email layout helper ---

function emailLayout(content: string, unsubscribeUrl?: string): string {
  const footerUnsub = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color:#888;text-decoration:underline;">Отписаться от уведомлений</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#2E86AB,#236B88);padding:24px 32px;text-align:center;">
          <div style="color:#ffffff;font-size:24px;font-weight:bold;">Гостинец</div>
        </td></tr>

        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;text-align:center;border-top:1px solid #eee;">
          <div style="font-size:12px;color:#888;line-height:1.6;">
            Гостинец — сервис бронирования<br>
            ${footerUnsub}
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// --- Auth emails ---

export async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.SMTP_HOST) return;

  const transporter = getTransporter();
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:8px;">✉️</div>
      <h1 style="font-size:22px;color:#1a1a1a;margin:0;">Подтвердите email</h1>
    </div>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Спасибо за регистрацию на Гостинец! Пожалуйста, подтвердите ваш email, нажав на кнопку ниже.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${verifyUrl}" style="display:inline-block;background:#2E86AB;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:bold;">
        Подтвердить email
      </a>
    </div>
    <p style="font-size:13px;color:#888;line-height:1.6;">
      Ссылка действительна 24 часа. Если вы не регистрировались, просто проигнорируйте это письмо.
    </p>`;

  const html = emailLayout(content);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Гостинец <noreply@gostinets.ru>',
    to: email,
    subject: 'Подтвердите ваш email — Гостинец',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!process.env.SMTP_HOST) return;

  const transporter = getTransporter();
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:8px;">🔑</div>
      <h1 style="font-size:22px;color:#1a1a1a;margin:0;">Сброс пароля</h1>
    </div>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Вы запросили сброс пароля. Нажмите на кнопку ниже, чтобы установить новый пароль.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#2E86AB;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:bold;">
        Установить новый пароль
      </a>
    </div>
    <p style="font-size:13px;color:#888;line-height:1.6;">
      Ссылка действительна 1 час. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
    </p>`;

  const html = emailLayout(content);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Гостинец <noreply@gostinets.ru>',
    to: email,
    subject: 'Сброс пароля — Гостинец',
    html,
  });
}

// --- Notification emails ---

export async function sendCheckinReminder(booking: Booking & { user?: { id: string } | null }) {
  if (!process.env.SMTP_HOST || !booking.guestEmail) return;

  const transporter = getTransporter();
  const unsubscribeUrl = booking.user?.id ? generateUnsubscribeUrl(booking.user.id) : undefined;

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:8px;">🏨</div>
      <h1 style="font-size:22px;color:#1a1a1a;margin:0;">Завтра заезд!</h1>
    </div>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Здравствуйте, ${booking.guestFirstName}!
    </p>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Напоминаем, что завтра, <strong>${booking.checkIn}</strong>, вас ждут в отеле
      <strong>${booking.hotelName}</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0;">
      <tr><td>
        <div style="font-size:13px;color:#888;margin-bottom:4px;">Номер</div>
        <div style="font-size:15px;color:#1a1a1a;font-weight:bold;">${booking.roomName}</div>
        <div style="font-size:13px;color:#888;margin-top:12px;margin-bottom:4px;">Бронирование</div>
        <div style="font-size:15px;color:#1a1a1a;font-weight:bold;">${booking.bookingId}</div>
        <div style="font-size:13px;color:#888;margin-top:12px;margin-bottom:4px;">Даты</div>
        <div style="font-size:15px;color:#1a1a1a;">${booking.checkIn} — ${booking.checkOut}</div>
      </td></tr>
    </table>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Предъявите ваучер бронирования при заселении. Хорошей поездки!
    </p>`;

  const html = emailLayout(content, unsubscribeUrl);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Гостинец <noreply@gostinets.ru>',
    to: booking.guestEmail,
    subject: `Завтра заезд в ${booking.hotelName} — Гостинец`,
    html,
  });
}

export async function sendReviewRequest(
  booking: Booking & { user?: { id: string; bonusBalance?: number } | null },
  bonusEarned: number,
) {
  if (!process.env.SMTP_HOST || !booking.guestEmail) return;

  const transporter = getTransporter();
  const unsubscribeUrl = booking.user?.id ? generateUnsubscribeUrl(booking.user.id) : undefined;
  const baseUrl = getBaseUrl();
  const reviewUrl = `${baseUrl}/hotels/${booking.hotelSlug}#reviews`;

  const bonusSection = bonusEarned > 0
    ? `<div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <div style="font-size:14px;color:#16a34a;font-weight:bold;">+${bonusEarned} бонусов начислено за эту поездку!</div>
      </div>`
    : '';

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:8px;">⭐</div>
      <h1 style="font-size:22px;color:#1a1a1a;margin:0;">Как прошла поездка?</h1>
    </div>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Здравствуйте, ${booking.guestFirstName}!
    </p>
    <p style="font-size:15px;color:#333;line-height:1.6;">
      Надеемся, вам понравилось пребывание в отеле <strong>${booking.hotelName}</strong>.
      Будем благодарны, если вы оставите отзыв — это поможет другим путешественникам!
    </p>
    ${bonusSection}
    <div style="text-align:center;margin:24px 0;">
      <a href="${reviewUrl}" style="display:inline-block;background:#2E86AB;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:bold;">
        Оставить отзыв
      </a>
    </div>`;

  const html = emailLayout(content, unsubscribeUrl);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Гостинец <noreply@gostinets.ru>',
    to: booking.guestEmail,
    subject: `Оставьте отзыв о ${booking.hotelName} — Гостинец`,
    html,
  });
}

// --- Original booking confirmation (kept as-is with layout) ---

export async function sendBookingConfirmation(booking: Booking) {
  if (!process.env.SMTP_HOST || !booking.guestEmail) return;

  const transporter = getTransporter();

  const nightsText = pluralize(booking.nights, 'ночь', 'ночи', 'ночей');
  const guestsText = pluralize(booking.guests, 'гость', 'гостя', 'гостей');

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#2E86AB,#236B88);padding:32px;text-align:center;">
          <div style="color:#ffffff;font-size:24px;font-weight:bold;margin-bottom:8px;">Гостинец</div>
          <div style="color:rgba(255,255,255,0.8);font-size:14px;">Электронный ваучер</div>
          <div style="color:#ffffff;font-family:monospace;font-size:18px;font-weight:bold;margin-top:12px;">${booking.bookingId}</div>
        </td></tr>

        <!-- Hotel & Room -->
        <tr><td style="padding:24px 32px 0;">
          <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:4px;">Отель</div>
          <div style="font-size:18px;font-weight:bold;color:#1a1a1a;">${booking.hotelName}</div>
        </td></tr>
        <tr><td style="padding:12px 32px 0;">
          <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:4px;">Номер</div>
          <div style="font-size:15px;color:#1a1a1a;">${booking.roomName}</div>
        </td></tr>

        <!-- Dates & Guests -->
        <tr><td style="padding:16px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding-right:8px;">
                <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:4px;">Заезд</div>
                <div style="font-size:15px;color:#1a1a1a;font-weight:bold;">${booking.checkIn}</div>
              </td>
              <td width="50%" style="padding-left:8px;">
                <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:4px;">Выезд</div>
                <div style="font-size:15px;color:#1a1a1a;font-weight:bold;">${booking.checkOut}</div>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 32px 0;">
          <span style="font-size:14px;color:#555;">${nightsText}, ${guestsText}</span>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:20px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;"></td></tr>

        <!-- Price -->
        <tr><td style="padding:16px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:#555;padding-bottom:6px;">Стоимость (${formatPriceShort(booking.pricePerNight)} × ${nightsText})</td>
              <td align="right" style="font-size:14px;color:#1a1a1a;padding-bottom:6px;">${formatPriceShort(booking.totalPrice)}</td>
            </tr>
            ${booking.discount > 0 ? `
            <tr>
              <td style="font-size:14px;color:#16a34a;padding-bottom:6px;">Скидка</td>
              <td align="right" style="font-size:14px;color:#16a34a;padding-bottom:6px;">−${formatPriceShort(booking.discount)}</td>
            </tr>` : ''}
            <tr>
              <td style="font-size:16px;font-weight:bold;color:#1a1a1a;padding-top:8px;border-top:1px solid #eee;">Итого</td>
              <td align="right" style="font-size:16px;font-weight:bold;color:#1a1a1a;padding-top:8px;border-top:1px solid #eee;">${formatPriceShort(booking.finalPrice)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Payment Method -->
        <tr><td style="padding:16px 32px 0;">
          <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:4px;">Способ оплаты</div>
          <div style="font-size:14px;color:#1a1a1a;">${paymentLabels[booking.paymentMethod] || booking.paymentMethod}</div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:20px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;"></td></tr>

        <!-- Guest -->
        <tr><td style="padding:16px 32px 0;">
          <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:4px;">Гость</div>
          <div style="font-size:15px;color:#1a1a1a;font-weight:bold;">${booking.guestFirstName} ${booking.guestLastName}</div>
          <div style="font-size:14px;color:#555;margin-top:4px;">${booking.guestEmail} · ${booking.guestPhone}</div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px;text-align:center;">
          <div style="font-size:13px;color:#888;line-height:1.5;">
            Спасибо за бронирование через Гостинец!<br>
            Предъявите этот ваучер при заселении.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Гостинец <noreply@gostinets.ru>',
    to: booking.guestEmail,
    subject: `Ваучер бронирования ${booking.bookingId} — Гостинец`,
    html,
  });
}
