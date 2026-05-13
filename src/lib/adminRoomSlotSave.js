import { weekdaysToDbArray } from '@/lib/slotWeekdays';

const KEEP_GOING_YEARS = 5;

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function allowedWeekdaysList(form) {
  const db = weekdaysToDbArray(form.weekdays);
  return db ?? [0, 1, 2, 3, 4, 5, 6];
}

function isoMatchesWeekday(isoStr, list) {
  const day = new Date(`${isoStr}T12:00:00`).getDay();
  return list.includes(day);
}

function computeRepeatEndIso(form) {
  if (form.slot_repeat_mode === 'keep_going') {
    const d = new Date(`${form.slot_date}T12:00:00`);
    d.setFullYear(d.getFullYear() + KEEP_GOING_YEARS);
    return toIsoDate(d);
  }
  if (form.slot_repeat_mode === 'until_date') return form.repeat_until_date || null;
  return null;
}

/**
 * Create or update room_slots (shared by manage-rooms and admin calendar).
 * @returns {{ ok: boolean, refreshDate?: string }}
 */
export async function saveRoomSlot({
  supabase,
  form,
  roomId,
  room,
  VR_CANONICAL_SLUG,
  VR_ALL_SLOT_SLUGS,
  setMessage,
}) {
  if (!form.slot_date || !form.start_time || !form.end_time) {
    setMessage('Please select date, start time, and end time.');
    return { ok: false };
  }
  if (form.end_time <= form.start_time) {
    setMessage('End time must be later than start time.');
    return { ok: false };
  }

  const repeatWeekdaysDb = weekdaysToDbArray(form.weekdays);
  if (Array.isArray(repeatWeekdaysDb) && repeatWeekdaysDb.length === 0) {
    setMessage('Select at least one active weekday.');
    return { ok: false };
  }

  const buildInsertRow = (slotDate) => {
    const row = {
      room_slug: roomId === VR_CANONICAL_SLUG ? VR_CANONICAL_SLUG : roomId,
      room_name: room?.name || roomId,
      slot_date: slotDate,
      start_time: form.start_time,
      end_time: form.end_time,
      capacity: Number(form.capacity) || 1,
      price_2: Number(form.price_2) || 0,
      price_3: Number(form.price_3) || 0,
      price_4: Number(form.price_4) || 0,
      price_5: Number(form.price_5) || 0,
      price_6: Number(form.price_6) || 0,
      price_7: Number(form.price_7) || 0,
      price_8: Number(form.price_8) || 0,
      is_blocked: Boolean(form.is_blocked),
      block_reason: form.block_reason || null,
    };
    if (Array.isArray(repeatWeekdaysDb) && repeatWeekdaysDb.length > 0) {
      row.repeat_weekdays = repeatWeekdaysDb;
    }
    return row;
  };

  const updatePayload = {
    ...buildInsertRow(form.slot_date),
    repeat_weekdays: repeatWeekdaysDb,
  };

  if (form.id) {
    const { error } = await supabase.from('room_slots').update(updatePayload).eq('id', form.id);
    if (error) {
      setMessage(`Update failed: ${error.message}`);
      return { ok: false };
    }
    setMessage('Slot updated.');
  } else {
    const weekdaysEffective = allowedWeekdaysList(form);

    const insertMultiDay = async (repeatEndIso) => {
      if (!repeatEndIso || repeatEndIso < form.slot_date) {
        setMessage('Repeat end date must be on or after the slot start date.');
        return false;
      }

      const existingSlugQuery =
        roomId === VR_CANONICAL_SLUG
          ? supabase
              .from('room_slots')
              .select('slot_date,start_time,end_time')
              .in('room_slug', VR_ALL_SLOT_SLUGS)
              .eq('start_time', form.start_time)
          : supabase
              .from('room_slots')
              .select('slot_date,start_time,end_time')
              .eq('room_slug', roomId)
              .eq('start_time', form.start_time);

      const { data: existingRows, error: existingError } = await existingSlugQuery
        .eq('end_time', form.end_time)
        .gte('slot_date', form.slot_date)
        .lte('slot_date', repeatEndIso);

      if (existingError) {
        setMessage(`Create failed: ${existingError.message}`);
        return false;
      }

      const existingDates = new Set((existingRows || []).map((row) => row.slot_date));
      const start = new Date(`${form.slot_date}T12:00:00`);
      const end = new Date(`${repeatEndIso}T12:00:00`);
      const rowsToInsert = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const slotDate = toIsoDate(d);
        if (!isoMatchesWeekday(slotDate, weekdaysEffective)) continue;
        if (existingDates.has(slotDate)) continue;
        rowsToInsert.push(buildInsertRow(slotDate));
      }

      if (rowsToInsert.length > 0) {
        const { error } = await supabase.from('room_slots').insert(rowsToInsert);
        if (error) {
          setMessage(`Create failed: ${error.message}`);
          return false;
        }
        const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const skipped = Math.max(dayCount - rowsToInsert.length, 0);
        setMessage(
          `Added ${rowsToInsert.length} slots${skipped > 0 ? ` (${skipped} days skipped: weekday filter or already exists)` : ''}.`
        );
      } else {
        setMessage('No new slots added (weekday filter or all dates already exist).');
      }
      return true;
    };

    const mode = form.slot_repeat_mode || 'single';

    if (mode === 'single') {
      if (!isoMatchesWeekday(form.slot_date, weekdaysEffective)) {
        setMessage('Start date is not on an active weekday.');
        return { ok: false };
      }
      const { error } = await supabase.from('room_slots').insert(buildInsertRow(form.slot_date));
      if (error) {
        setMessage(`Create failed: ${error.message}`);
        return { ok: false };
      }
      setMessage('Slot added.');
    } else if (mode === 'until_date') {
      if (!form.repeat_until_date) {
        setMessage('Choose a repeat-until date.');
        return { ok: false };
      }
      const ok = await insertMultiDay(form.repeat_until_date);
      if (!ok) return { ok: false };
    } else if (mode === 'keep_going') {
      const endIso = computeRepeatEndIso(form);
      const ok = await insertMultiDay(endIso);
      if (!ok) return { ok: false };
    } else {
      if (!isoMatchesWeekday(form.slot_date, weekdaysEffective)) {
        setMessage('Start date is not on an active weekday.');
        return { ok: false };
      }
      const { error } = await supabase.from('room_slots').insert(buildInsertRow(form.slot_date));
      if (error) {
        setMessage(`Create failed: ${error.message}`);
        return { ok: false };
      }
      setMessage('Slot added.');
    }
  }

  const refreshDate =
    form.slot_date && String(form.slot_date).length >= 10 ? String(form.slot_date).slice(0, 10) : undefined;
  return { ok: true, refreshDate };
}
