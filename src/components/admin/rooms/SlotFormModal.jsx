'use client';

import { useEffect, useState } from 'react';
import styles from './SlotFormModal.module.css';

const INITIAL = {
  id: null,
  slot_date: '',
  start_time: '',
  end_time: '',
  apply_daily_until: false,
  repeat_until_date: '',
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

export default function SlotFormModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(INITIAL);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        id: initialData.id,
        slot_date: initialData.slot_date || '',
        start_time: initialData.start_time || '',
        end_time: initialData.end_time || '',
        apply_daily_until: false,
        repeat_until_date: '',
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
    setForm(INITIAL);
  }, [open, initialData]);

  if (!open) return null;

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
          {!form.id && (
            <>
              <label className={styles.field}>
                <span>Repeat Daily</span>
                <select
                  value={form.apply_daily_until ? 'yes' : 'no'}
                  onChange={(e) => setForm((p) => ({ ...p, apply_daily_until: e.target.value === 'yes' }))}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Repeat Until Date</span>
                <input
                  type="date"
                  value={form.repeat_until_date}
                  min={form.slot_date || undefined}
                  disabled={!form.apply_daily_until}
                  onChange={(e) => setForm((p) => ({ ...p, repeat_until_date: e.target.value }))}
                />
              </label>
            </>
          )}
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
          <label className={styles.field}>
            <span>Blocked</span>
            <select value={form.is_blocked ? 'yes' : 'no'} onChange={(e) => setForm((p) => ({ ...p, is_blocked: e.target.value === 'yes' }))}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Block reason</span>
            <input value={form.block_reason} onChange={(e) => setForm((p) => ({ ...p, block_reason: e.target.value }))} placeholder="Maintenance / private event..." />
          </label>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.primary} onClick={() => onSave(form)}>{form.id ? 'Save Slot' : 'Add Slot'}</button>
        </div>
      </div>
    </div>
  );
}
