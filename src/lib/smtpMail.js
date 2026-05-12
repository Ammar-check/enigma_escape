import nodemailer from 'nodemailer';

/**
 * Office 365 / SMTP — credentials only via env (never commit passwords).
 * Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional: SMTP_FROM (defaults to SMTP_USER), BOOKING_BCC_EMAIL
 */

export function createTransportFromEnv() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildBookingEmailHtml({
  status,
  firstName,
  bookingNumber,
  room,
  date,
  time,
  adults,
  price,
}) {
  const name = escapeHtml(firstName || 'Guest');
  const bn = escapeHtml(bookingNumber);
  const rm = escapeHtml(room);
  const dt = escapeHtml(date);
  const tm = escapeHtml(time);

  const titles = {
    booked: 'Booking confirmed — Enigma Escape Games',
    pending: 'Booking pending — Enigma Escape Games',
    cancelled: 'Booking cancelled — Enigma Escape Games',
  };

  const intros = {
    booked: `Hi ${name}, thank you for booking with Enigma Escape Games. Your reservation is recorded as confirmed.`,
    pending: `Hi ${name}, your booking is currently pending review. We will contact you shortly.`,
    cancelled: `Hi ${name}, your booking has been cancelled. If you did not request this, please contact us.`,
  };

  const title = titles[status] || titles.booked;
  const intro = intros[status] || intros.booked;

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#111;">
  <h2 style="color:#b8860b;">${escapeHtml(title)}</h2>
  <p>${intro}</p>
  <table cellpadding="8" style="border-collapse:collapse;">
    <tr><td><strong>Booking #</strong></td><td>${bn}</td></tr>
    <tr><td><strong>Room</strong></td><td>${rm}</td></tr>
    <tr><td><strong>Date</strong></td><td>${dt}</td></tr>
    <tr><td><strong>Time</strong></td><td>${tm}</td></tr>
    <tr><td><strong>Players</strong></td><td>${escapeHtml(String(adults))}</td></tr>
    <tr><td><strong>Total (SAR)</strong></td><td>${escapeHtml(String(price ?? ''))}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#666;">Enigma Escape Games · Khobar, Saudi Arabia</p>
</body>
</html>`;
}

export async function sendBookingEmail({
  to,
  status,
  firstName,
  bookingNumber,
  room,
  date,
  time,
  adults,
  price,
}) {
  const transport = createTransportFromEnv();
  if (!transport) {
    console.warn('[smtpMail] SMTP env not configured; skipping email.');
    return { sent: false, reason: 'no_smtp' };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const titles = {
    booked: 'Booking confirmed — Enigma Escape Games',
    pending: 'Booking pending — Enigma Escape Games',
    cancelled: 'Booking cancelled — Enigma Escape Games',
  };
  const subject = titles[status] || titles.booked;

  const html = buildBookingEmailHtml({
    status,
    firstName,
    bookingNumber,
    room,
    date,
    time,
    adults,
    price,
  });

  const mail = {
    from: `"Enigma Escape Games" <${from}>`,
    to,
    subject,
    html,
  };

  const bcc = process.env.BOOKING_BCC_EMAIL;
  if (bcc) {
    mail.bcc = bcc;
  }

  await transport.sendMail(mail);
  return { sent: true };
}
