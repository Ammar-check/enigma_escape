import { getSupabaseServerClient } from '@/lib/supabaseServer';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

function validate(body) {
  const fullName = (body.fullName || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (fullName.length < 3 || fullName.length > 100) {
    return { valid: false, error: 'Full name must be between 3 and 100 characters.' };
  }

  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Please provide a valid phone number.' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }

  if (message.length < 10 || message.length > 1000) {
    return { valid: false, error: 'Message must be between 10 and 1000 characters.' };
  }

  return { valid: true, data: { fullName, phone, email, message } };
}

export async function POST(request) {
  try {
    const supabaseServer = getSupabaseServerClient();
    const body = await request.json();
    const result = validate(body);

    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    const { fullName, phone, email, message } = result.data;

    const { error } = await supabaseServer.from('contact_messages').insert([
      {
        full_name: fullName,
        phone,
        email,
        message,
      },
    ]);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ message: 'Message sent successfully.' }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message || 'Invalid request payload.' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const supabaseServer = getSupabaseServerClient();
    const { data, error } = await supabaseServer
      .from('contact_messages')
      .select('id, full_name, phone, email, message, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to load messages.' }, { status: 500 });
  }
}
