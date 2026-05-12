import { sendBookingEmail } from '@/lib/smtpMail';

/**
 * Send status emails (pending / cancelled / booked) without inserting a row.
 * Protect with BOOKING_NOTIFY_SECRET — call from Zapier, Supabase webhook, or admin tool.
 *
 * Headers: Authorization: Bearer <BOOKING_NOTIFY_SECRET>
 * Body JSON: { email, firstName, bookingNumber, room, date, time, adults, price, status }
 */

export async function POST(request) {
  try {
    const secret = process.env.BOOKING_NOTIFY_SECRET;
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!secret || token !== secret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const status = String(body.status || '').toLowerCase();
    const allowed = ['booked', 'pending', 'cancelled'];
    if (!allowed.includes(status)) {
      return Response.json({ error: 'status must be booked, pending, or cancelled' }, { status: 400 });
    }

    const email = (body.email || '').trim();
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 });
    }

    await sendBookingEmail({
      to: email,
      status,
      firstName: body.firstName || body.first_name,
      bookingNumber: body.bookingNumber || body.booking_number,
      room: body.room || body.tour,
      date: body.date,
      time: body.time,
      adults: body.adults,
      price: body.price,
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[api/bookings/notify]', e);
    return Response.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
