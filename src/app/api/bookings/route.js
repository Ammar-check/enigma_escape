import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { sendBookingEmail } from '@/lib/smtpMail';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validate(body) {
  const firstName = (body.first_name || body.firstName || '').trim();
  const lastName = (body.last_name || body.lastName || '').trim();
  const email = (body.email_address || body.email || '').trim();
  const phone = (body.phone || '').trim();
  const room = (body.tour || body.room || '').trim();
  const dateStr = (body.date || '').trim();
  const timeStr = (body.time || '').trim();
  const adults = Number(body.adults ?? body.participants ?? 2);
  const price = Number(body.total_gross ?? body.price ?? 0);

  if (!firstName || firstName.length > 100) {
    return { valid: false, error: 'First name is required.' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Valid email is required.' };
  }
  if (!room || !dateStr || !timeStr) {
    return { valid: false, error: 'Room, date, and time are required.' };
  }
  if (!Number.isFinite(adults) || adults < 1 || adults > 50) {
    return { valid: false, error: 'Invalid number of players.' };
  }

  return {
    valid: true,
    data: {
      firstName,
      lastName,
      email,
      phone,
      room,
      dateStr,
      timeStr,
      adults,
      price,
    },
  };
}

/**
 * Creates a booking in Supabase (server-side) and sends customer email (booked | pending).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const result = validate(body);

    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    const { firstName, lastName, email, phone, room, dateStr, timeStr, adults, price } =
      result.data;

    const bookingNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const startAt = `${dateStr}T${timeStr}:00`;
    const status = (body.status || 'booked').toLowerCase();
    const allowedStatus = ['booked', 'pending'];
    const insertStatus = allowedStatus.includes(status) ? status : 'booked';

    const payload = {
      booking_number: bookingNumber,
      start_at: startAt,
      first_name: firstName,
      last_name: lastName,
      email_address: email,
      phone,
      participants: adults,
      adults,
      tour: room,
      status: insertStatus,
      total_gross: price,
      total_paid: 0,
      total_due: price,
      alert: 'Terms accepted by customer',
    };

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('bookings').insert(payload);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    let emailResult = { sent: false };
    try {
      emailResult = await sendBookingEmail({
        to: email,
        status: insertStatus,
        firstName,
        bookingNumber,
        room,
        date: dateStr,
        time: timeStr,
        adults,
        price,
      });
    } catch (mailErr) {
      console.error('[api/bookings] Email failed:', mailErr);
      emailResult = { sent: false, error: mailErr.message };
    }

    return Response.json(
      {
        bookingNumber,
        emailSent: emailResult.sent,
      },
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ error: e.message || 'Invalid request.' }, { status: 400 });
  }
}
