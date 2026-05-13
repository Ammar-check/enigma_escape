'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SlotFormModal.module.css';
import { weekdaysFromDbArray } from '@/lib/slotWeekdays';

const ALL_DAYS = { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true };

const INITIAL = {
  id: null,
  slot_date: '',
  start_time: '',
  end_time: '',
  slot_repeat_mode: 'single',
  repeat_until_date: '',
  weekdays: { ...ALL_DAYS },
  capacity: 6,
  is_blocked: false,
  block_reason: '',
  price_2: 340,
  price_3: 495,
  price_4: 640,
  price_5: 775,
  price_6: 900,
  price_7: 1120,
  price_8: 1280,
};

const freshForm = () => ({
  ...INITIAL,
  weekdays: { ...ALL_DAYS },
});

const WEEKDAY_OPTIONS = [
  { key: 1, label: 'Mon' },
  { key: 2, label: 'Tue' },
  { key: 3, label: 'Wed' },
  { key: 4, label: 'Thu' },
  { key: 5, label: 'Fri' },
  { key: 6, label: 'Sat' },
  { key: 0, label: 'Sun' },
];

export default function SlotFormModal({ open, onClose, onSave, initialData, defaultSlotDate }) {
  const [form, setForm] = useState(() => freshForm());
  const [saving, setSaving] = useState(false);
  const defaultSlotDateRef = useRef(defaultSlotDate);
  defaultSlotDateRef.current = defaultSlotDate;

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        id: initialData.id,
        slot_date: initialData.slot_date || '',
        start_time: initialData.start_time || '',
        end_time: initialData.end_time || '',
        slot_repeat_mode: 'single',
        repeat_until_date: '',
        weekdays: weekdaysFromDbArray(initialData.repeat_weekdays),
        capacity: initialData.capacity ?? 6,
        is_blocked: Boolean(initialData.is_blocked),
        block_reason: initialData.block_reason || '',
        price_2: initialData.price_2 ?? 340,
        price_3: initialData.price_3 ?? 495,
        price_4: initialData.price_4 ?? 640,
        price_5: initialData.price_5 ?? 775,
        price_6: initialData.price_6 ?? 900,
        price_7: initialData.price_7 ?? 1120,
        price_8: initialData.price_8 ?? 1280,
      });
      return;
    }
    const next = freshForm();
    const d = defaultSlotDateRef.current;
    if (d && String(d).length >= 10) {
      next.slot_date = String(d).slice(0, 10);
    }
    setForm(next);
  }, [open, initialData]);

  const toggleWeekday = (key) => {
    setForm((p) => ({
      ...p,
      weekdays: { ...p.weekdays, [key]: !p.weekdays[key] },
    }));
  };

  if (!open) return null;

  const isNew = !form.id;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h3 className={styles.title}>{form.id ? 'Edit Slot' : 'Add Slot'}</h3>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Date</span>
            <input
              type="date"
              value={form.slot_date}
              onChange={(e) => setForm((p) => ({ ...p, slot_date: e.target.value }))}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Start (HH:MM)</span>
            <input
              type="time"
              step="60"
              value={form.start_time}
              onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
              required
            />
          </label>
          <label className={styles.field}>
            <span>End (HH:MM)</span>
            <input
              type="time"
              step="60"
              value={form.end_time}
              onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Capacity</span>
            <input type="number" min={1} value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} />
          </label>
          <label className={styles.field}>
            <span>Blocked</span>
            <select value={form.is_blocked ? 'yes' : 'no'} onChange={(e) => setForm((p) => ({ ...p, is_blocked: e.target.value === 'yes' }))}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className={`${styles.field} ${styles.fieldSpan2}`}>
            <span>Block reason</span>
            <input
              value={form.block_reason}
              onChange={(e) => setForm((p) => ({ ...p, block_reason: e.target.value }))}
              placeholder="Maintenance / private event..."
            />
          </label>
        </div>

        {isNew && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Slots mode</div>
            <div className={styles.modeRow}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="slot_repeat_mode"
                  checked={form.slot_repeat_mode === 'single'}
                  onChange={() => setForm((p) => ({ ...p, slot_repeat_mode: 'single' }))}
                />
                <span>Single day</span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="slot_repeat_mode"
                  checked={form.slot_repeat_mode === 'until_date'}
                  onChange={() => setForm((p) => ({ ...p, slot_repeat_mode: 'until_date' }))}
                />
                <span>Pick date — repeat until an end date</span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="slot_repeat_mode"
                  checked={form.slot_repeat_mode === 'keep_going'}
                  onChange={() => setForm((p) => ({ ...p, slot_repeat_mode: 'keep_going' }))}
                />
                <span>Keep going — repeat for 5 years (extend later if needed)</span>
              </label>
            </div>
            {form.slot_repeat_mode === 'until_date' && (
              <label className={styles.field} style={{ marginTop: 10 }}>
                <span>Repeat until date</span>
                <input
                  type="date"
                  value={form.repeat_until_date}
                  min={form.slot_date || undefined}
                  onChange={(e) => setForm((p) => ({ ...p, repeat_until_date: e.target.value }))}
                />
              </label>
            )}
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Active weekdays</div>
          <p className={styles.hint}>Slots only apply on checked days. Uncheck Sat/Sun to skip weekends.</p>
          <div className={styles.weekdayRow}>
            {WEEKDAY_OPTIONS.map(({ key, label }) => (
              <label key={key} className={styles.weekdayChip}>
                <input type="checkbox" checked={Boolean(form.weekdays[key])} onChange={() => toggleWeekday(key)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Pricing (2–8 adults)</div>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Price (2 adults)</span>
              <input type="number" min={0} step="1" value={form.price_2} onChange={(e) => setForm((p) => ({ ...p, price_2: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Price (3 adults)</span>
              <input type="number" min={0} step="1" value={form.price_3} onChange={(e) => setForm((p) => ({ ...p, price_3: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Price (4 adults)</span>
              <input type="number" min={0} step="1" value={form.price_4} onChange={(e) => setForm((p) => ({ ...p, price_4: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Price (5 adults)</span>
              <input type="number" min={0} step="1" value={form.price_5} onChange={(e) => setForm((p) => ({ ...p, price_5: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Price (6 adults)</span>
              <input type="number" min={0} step="1" value={form.price_6} onChange={(e) => setForm((p) => ({ ...p, price_6: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Price (7 adults)</span>
              <input type="number" min={0} step="1" value={form.price_7} onChange={(e) => setForm((p) => ({ ...p, price_7: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <span>Price (8 adults)</span>
              <input type="number" min={0} step="1" value={form.price_8} onChange={(e) => setForm((p) => ({ ...p, price_8: e.target.value }))} />
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave?.(form);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? 'Saving…' : form.id ? 'Save Slot' : 'Add Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
