'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminBookSlotModal.module.css';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const blank = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  adults: 2,
  status: 'booked',
  price: 0,
};

function priceForAdults(slot, adults) {
  if (!slot) return 0;
  const map = {
    2: slot.price_2,
    3: slot.price_3,
    4: slot.price_4,
    5: slot.price_5,
    6: slot.price_6,
    7: slot.price_7,
    8: slot.price_8,
  };
  return Number(map[adults] || 0);
}

export default function AdminBookSlotModal({ open, onClose, onBooked, slot, room }) {
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  const seatsLeft = useMemo(() => {
    if (!slot) return 0;
    return Math.max(Number(slot.capacity || 0) - Number(slot.bookedPlayers || 0), 0);
  }, [slot]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const initialAdults = Math.min(Math.max(2, 2), Math.max(seatsLeft, 1));
    setForm({
      ...blank,
      adults: initialAdults,
      price: priceForAdults(slot, initialAdults),
    });
    setErrorMsg('');
    setSuccessMsg('');
  }, [open, slot, seatsLeft]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open || !slot || !room) return null;

  const updateAdults = (n) => {
    const clamped = Math.max(1, Math.min(Number(n) || 1, seatsLeft || 1));
    setForm((p) => ({ ...p, adults: clamped, price: priceForAdults(slot, clamped) }));
  };

  const submit = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const adults = Number(form.adults) || 0;
    const price = Number(form.price) || 0;

    if (!firstName) {
      setErrorMsg('First name is required.');
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMsg('Valid email is required.');
      return;
    }
    if (adults < 1) {
      setErrorMsg('At least 1 player is required.');
      return;
    }
    if (seatsLeft > 0 && adults > seatsLeft) {
      setErrorMsg(`Only ${seatsLeft} seat(s) left for this slot.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email_address: email,
          phone,
          tour: room.name,
          date: slot.slot_date,
          time: String(slot.start_time || '').slice(0, 5),
          adults,
          total_gross: price,
          status: form.status,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrorMsg(result?.error || 'Failed to create booking.');
        return;
      }

      setSuccessMsg(`Booking #${result.bookingNumber} created${result.emailSent ? ' & email sent' : ''}.`);
      window.setTimeout(() => {
        onBooked?.(result);
      }, 600);
    } catch (err) {
      console.error('[AdminBookSlotModal] submit failed:', err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Book seats for customer</h3>
            <p className={styles.subtitle}>
              {room.name} · {slot.slot_date} · {String(slot.start_time || '').slice(0, 5)}–
              {String(slot.end_time || '').slice(0, 5)}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.slotInfoBox}>
          <div className={styles.slotInfoCell}>
            <span className={styles.slotInfoLabel}>Capacity</span>
            <span className={styles.slotInfoValue}>{slot.capacity}</span>
          </div>
          <div className={styles.slotInfoCell}>
            <span className={styles.slotInfoLabel}>Booked</span>
            <span className={styles.slotInfoValue}>{slot.bookedPlayers || 0}</span>
          </div>
          <div className={styles.slotInfoCell}>
            <span className={styles.slotInfoLabel}>Seats left</span>
            <span className={styles.slotInfoValue}>{seatsLeft}</span>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>First name *</span>
            <input
              value={form.first_name}
              onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
              required
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span>Last name</span>
            <input
              value={form.last_name}
              onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span>Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span>Players (adults)</span>
            <input
              type="number"
              min={1}
              max={seatsLeft || 1}
              value={form.adults}
              onChange={(e) => updateAdults(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="booked">Booked</option>
              <option value="pending">Pending</option>
            </select>
          </label>
          <label className={`${styles.field} ${styles.fieldSpan2}`}>
            <span>Total price (SAR)</span>
            <input
              type="number"
              min={0}
              step="1"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
            <span className={styles.hint}>
              Auto-set from slot pricing for the chosen player count. You can override.
            </span>
          </label>
        </div>

        {errorMsg ? <p className={styles.message}>{errorMsg}</p> : null}
        {successMsg ? <p className={styles.success}>{successMsg}</p> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className={styles.primary} onClick={submit} disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
