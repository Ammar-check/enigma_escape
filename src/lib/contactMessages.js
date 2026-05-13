import { supabase } from '@/lib/supabase';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

export function validateContactPayload(body) {
  const fullName = String(body.fullName || '').trim();
  const phone = String(body.phone || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

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

/**
 * Submit a contact message. Tries the Next.js API route first; if the API is
 * unavailable (e.g. static export deployed to Netlify), falls back to a direct
 * Supabase anon insert. Returns a normalised { ok, error } shape.
 */
export async function submitContactMessage(formData) {
  const validation = validateContactPayload(formData);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }
  const { fullName, phone, email, message } = validation.data;

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone, email, message }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const result = await response.json().catch(() => null);
      if (response.ok) return { ok: true };
      if (result?.error) return { ok: false, error: result.error };
    }
    if (response.ok) return { ok: true };
  } catch {
    // ignore — fall through to Supabase fallback
  }

  const { error } = await supabase.from('contact_messages').insert([
    {
      full_name: fullName,
      phone,
      email,
      message,
    },
  ]);

  if (error) {
    return { ok: false, error: error.message || 'Failed to send message.' };
  }
  return { ok: true };
}

/**
 * Fetch the latest contact messages. Tries the API first; falls back to a
 * direct Supabase anon select for static-exported sites.
 */
export async function fetchContactMessages(limit = 200) {
  try {
    const response = await fetch('/api/contact', { cache: 'no-store' });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const result = await response.json().catch(() => null);
      if (response.ok && Array.isArray(result?.data)) {
        return { ok: true, data: result.data };
      }
      if (result?.error) {
        // fall through to Supabase fallback
      }
    }
  } catch {
    // ignore — fall through to Supabase fallback
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, full_name, phone, email, message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { ok: false, error: error.message || 'Failed to load contact messages.' };
  }
  return { ok: true, data: data || [] };
}
