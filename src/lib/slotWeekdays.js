/** JS weekday: 0 Sun … 6 Sat (Date.getDay). */

export function slotAppliesOnDate(slot, isoDateStr) {
  const raw = slot?.repeat_weekdays;
  if (raw == null) return true;
  if (!Array.isArray(raw) || raw.length === 0) return true;
  const day = new Date(`${isoDateStr}T12:00:00`).getDay();
  return raw.includes(day);
}

export function weekdaysFromDbArray(arr) {
  const all = { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true };
  if (!arr || !Array.isArray(arr) || arr.length === 0) return { ...all };
  const next = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  arr.forEach((n) => {
    if (typeof n === 'number' && n >= 0 && n <= 6) next[n] = true;
  });
  return next;
}

export function weekdaysToDbArray(weekdaysObj) {
  const selected = [0, 1, 2, 3, 4, 5, 6].filter((d) => weekdaysObj?.[d]);
  if (selected.length === 7) return null;
  return selected;
}
