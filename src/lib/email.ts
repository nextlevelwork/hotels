import nodemailer from 'nodemailer';
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
