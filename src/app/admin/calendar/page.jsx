'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import {
  ROOM_CATALOG,
  VR_CANONICAL_SLUG,
  VR_LEGACY_SLUGS,
} from '@/data/roomCatalog';
import { slotAppliesOnDate } from '@/lib/slotWeekdays';
import AdminBookSlotModal from '@/components/admin/calendar/AdminBookSlotModal';

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDatePart = (value) => String(value || '').slice(0, 10);
const getTimePart = (value) => String(value || '').slice(11, 16);
const isInSlotRange = (time, start, end) =>
  Boolean(time && start && end && time >= start.slice(0, 5) && time < end.slice(0, 5));

const ROOM_ALIASES = {
  'the-butcher': ['the butcher', 'butcher'],
  'the-lost-city': ['the lost city', 'lost city'],
  'sherlock-doomsday-device': ['sherlock', 'doomsday', 'sherlock doomsday device'],
  'vr-room': [
    'vr room',
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `vr room ${n}`),
    'vr-room',
    ...VR_LEGACY_SLUGS,
  ],
  'outdoor-escape': ['outdoor escape', 'mind shield', 'mindshield'],
};

const isBookingForRoom = (booking, room) => {
  const tour = String(booking?.tour || '').toLowerCase();
  if (!tour) return false;
  const slug = String(room.slug || '').toLowerCase();
  const name = String(room.name || '').toLowerCase();
  const compactName = name.replace(/[^\w]+/g, ' ').trim();
  const aliases = ROOM_ALIASES[slug] || [];
  return tour.includes(slug) || (compactName && tour.includes(compactName)) || aliases.some((alias) => tour.includes(alias));
};

const isCanceledStatus = (status) => {
  const s = String(status || '').toLowerCase();
  return s.includes('cancel');
};

function formatHeadingDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [roomSlotsMap, setRoomSlotsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [viewMode, setViewMode] = useState('boxes');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingContext, setBookingContext] = useState(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const rooms = useMemo(() => ROOM_CATALOG, []);

  const fetchCalendarData = async (date) => {
    setLoading(true);
    setMessage('');
    try {
      const [{ data: slots, error: slotError }, { data: bookings, error: bookingError }] = await Promise.all([
        supabase
          .from('room_slots')
          .select('*')
          .eq('slot_date', date)
          .order('start_time', { ascending: true }),
        supabase
          .from('bookings')
          .select('*')
          .gte('start_at', `${date}T00:00:00`)
          .lt('start_at', `${date}T23:59:59`),
      ]);

      if (slotError) {
        setMessage(`Slots load failed: ${slotError.message}`);
      }
      if (bookingError) {
        setMessage((prev) => prev || `Bookings load failed: ${bookingError.message}`);
      }

      const safeSlots = slots || [];
      const safeBookings = bookings || [];
      const nextMap = {};
      rooms.forEach((room) => {
        nextMap[room.slug] = [];
      });

      safeSlots.forEach((slot) => {
        if (!slotAppliesOnDate(slot, slot.slot_date)) return;
        const normalizedSlug =
          slot.room_slug === VR_CANONICAL_SLUG || VR_LEGACY_SLUGS.includes(slot.room_slug)
            ? VR_CANONICAL_SLUG
            : slot.room_slug;
        const room = rooms.find((item) => item.slug === normalizedSlug);
        if (!room) return;
        const slotBookings = safeBookings.filter((booking) => {
          if (!booking.start_at) return false;
          const bookingDate = getDatePart(booking.start_at);
          const bookingTime = getTimePart(booking.start_at);
          return bookingDate === slot.slot_date && isInSlotRange(bookingTime, slot.start_time, slot.end_time) && isBookingForRoom(booking, room);
        });
        const activeBookings = slotBookings.filter((b) => !isCanceledStatus(b.status));
        const canceledBookings = slotBookings.filter((b) => isCanceledStatus(b.status));
        const bookedPlayers = activeBookings.reduce(
          (sum, booking) => sum + Number(booking.participants || booking.adults || 0),
          0
        );
        const capacity = Number(slot.capacity || 0);
        const availableSeats = Math.max(capacity - bookedPlayers, 0);
        const isFull = Boolean(slot.is_blocked) || availableSeats <= 0;
        nextMap[room.slug].push({
          ...slot,
          roomName: room.name,
          bookings: slotBookings,
          activeBookings,
          canceledBookings,
          bookingsCount: activeBookings.length,
          bookedPlayers,
          availableSeats,
          isFull,
        });
      });

      setRoomSlotsMap(nextMap);
    } catch (error) {
      console.error('Calendar load error:', error);
      setMessage('Unable to load calendar data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const filteredRoomSlotsMap = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roomSlotsMap;
    const next = {};
    rooms.forEach((room) => {
      const slots = roomSlotsMap[room.slug] || [];
      next[room.slug] = slots.filter((slot) => {
        const timeStr = `${slot.start_time}-${slot.end_time}`.toLowerCase();
        if (timeStr.includes(q)) return true;
        return slot.bookings.some((b) => {
          const name = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          return (
            name.includes(q) ||
            String(b.email_address || '').toLowerCase().includes(q) ||
            String(b.phone || '').includes(q) ||
            String(b.booking_number || b.id || '').toLowerCase().includes(q)
          );
        });
      });
    });
    return next;
  }, [roomSlotsMap, rooms, searchQuery]);

  const rowsViewItems = useMemo(() => {
    const items = [];
    rooms.forEach((room) => {
      (filteredRoomSlotsMap[room.slug] || []).forEach((slot) => {
        items.push({ room, slot });
      });
    });
    items.sort((a, b) => {
      const ta = String(a.slot.start_time || '');
      const tb = String(b.slot.start_time || '');
      if (ta !== tb) return ta.localeCompare(tb);
      return String(a.room.name).localeCompare(String(b.room.name));
    });
    return items;
  }, [filteredRoomSlotsMap, rooms]);

  const shiftDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(toIsoDate(date));
  };

  const printCalendar = () => {
    const summaryHtml = rooms
      .map((room) => {
        const slots = roomSlotsMap[room.slug] || [];
        const slotsHtml = slots
          .map((slot) => {
            const bookingLines = slot.bookings
              .map((booking) => {
                const customer = `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown';
                return `<li>${customer} | ${booking.phone || '—'} | ${booking.email_address || '—'} | ${booking.participants || booking.adults || 0} players | ${booking.status || 'booked'}</li>`;
              })
              .join('');
            return `
              <div style="border:1px solid #ddd;padding:8px;margin-bottom:8px;">
                <strong>${slot.start_time} - ${slot.end_time}</strong><br/>
                Capacity: ${slot.capacity} | Booked: ${slot.bookedPlayers} | Available: ${slot.availableSeats} | ${slot.isFull ? 'FULL' : 'OPEN'}
                ${bookingLines ? `<ul>${bookingLines}</ul>` : '<div>No bookings</div>'}
              </div>
            `;
          })
          .join('');
        return `<h3>${room.name}</h3>${slotsHtml || '<p>No slots</p>'}`;
      })
      .join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
      <head><title>Calendar ${selectedDate}</title></head>
      <body style="font-family:Arial;padding:20px;">
        <h1>Admin Calendar - ${selectedDate}</h1>
        ${summaryHtml}
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const downloadIcal = () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Enigma Escape//Admin//EN'];
    rooms.forEach((room) => {
      (roomSlotsMap[room.slug] || []).forEach((slot) => {
        const uid = `slot-${slot.id}@enigma-escape`;
        const dt = selectedDate.replace(/-/g, '');
        const st = String(slot.start_time || '00:00').replace(':', '');
        const et = String(slot.end_time || '00:00').replace(':', '');
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${uid}`);
        lines.push(`DTSTART:${dt}T${st.padEnd(6, '0')}00`);
        lines.push(`DTEND:${dt}T${et.padEnd(6, '0')}00`);
        lines.push(`SUMMARY:${room.name} ${slot.start_time}-${slot.end_time}`);
        lines.push('END:VEVENT');
      });
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enigma-calendar-${selectedDate}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const headingDate = useMemo(() => formatHeadingDate(selectedDate), [selectedDate]);

  const statusDotClass = (slot) => {
    if (slot.is_blocked) return styles.statusDotBlocked;
    if (slot.bookedPlayers > 0) return styles.statusDotFilled;
    return styles.statusDot;
  };

  const slotBodyClass = (slot) => {
    if (slot.is_blocked) return `${styles.slotBody} ${styles.slotBodyBlocked}`;
    if (slot.isFull && slot.bookedPlayers > 0) return `${styles.slotBody} ${styles.slotBodyBookedFull}`;
    if (slot.bookedPlayers > 0) return `${styles.slotBody} ${styles.slotBodyBookedPartial}`;
    return styles.slotBody;
  };

  const renderSlotCard = (room, slot) => {
    const startDisp = String(slot.start_time || '').slice(0, 5);
    const hasBookings = slot.bookings.length > 0;
    const primary = slot.activeBookings[0]
      ? `${slot.activeBookings[0].first_name || ''} ${slot.activeBookings[0].last_name || ''}`.trim()
      : '';

    const openDetails = () => {
      if (hasBookings) setSelectedSlot(slot);
    };

    const canBookMore = !slot.is_blocked && slot.availableSeats > 0;

    return (
      <div key={slot.id} className={styles.slotCardWrap}>
        <div className={styles.slotTimeBar}>{startDisp}</div>
        <div
          className={slotBodyClass(slot)}
          role={hasBookings ? 'button' : undefined}
          tabIndex={hasBookings ? 0 : undefined}
          onClick={hasBookings ? openDetails : undefined}
          onKeyDown={hasBookings ? (e) => (e.key === 'Enter' ? openDetails() : null) : undefined}
        >
          <span className={statusDotClass(slot)} aria-hidden />
          <div className={styles.slotBodyInner}>
            {slot.is_blocked ? (
              <>
                <div className={styles.slotLinePrimary}>Blocked</div>
                <div className={styles.slotLineMeta}>{slot.block_reason || '—'}</div>
              </>
            ) : primary ? (
              <>
                <div className={styles.slotLinePrimary}>{primary}</div>
                <div className={styles.slotLineMeta}>{slot.bookedPlayers} booked</div>
                <div className={styles.slotLineMeta}>{slot.availableSeats} available</div>
              </>
            ) : (
              <>
                <div className={styles.slotLineMeta}>{slot.bookedPlayers} booked</div>
                <div className={styles.slotLineMeta}>{slot.availableSeats} available</div>
              </>
            )}
          </div>
          <button
            type="button"
            className={styles.addSlotBtn}
            title={canBookMore ? 'Book seats for customer' : slot.is_blocked ? 'Slot is blocked' : 'No seats left'}
            aria-label="Book seats for customer"
            disabled={!canBookMore}
            onClick={(e) => {
              e.stopPropagation();
              if (!canBookMore) return;
              setBookingContext({ slot, room });
            }}
          >
            <i className="bi bi-plus-lg" />
          </button>
          {slot.canceledBookings.length > 0 ? (
            <span className={styles.cancelMark} title={`${slot.canceledBookings.length} canceled`}>
              <i className="bi bi-x-circle" />
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h1 className={styles.title}>
            Group tours <span className={styles.titleDate}>· {headingDate}</span>
          </h1>
          <p className={styles.subtitle}>Live slots and bookings · admin can book seats for customers</p>
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={viewMode === 'rows' ? styles.viewToggleActive : ''}
              onClick={() => setViewMode('rows')}
            >
              Rows
            </button>
            <button
              type="button"
              className={viewMode === 'boxes' ? styles.viewToggleActive : ''}
              onClick={() => setViewMode('boxes')}
            >
              Boxes
            </button>
          </div>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search time or guest…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search slots"
          />
        </div>
      </div>

      <div className={styles.navRow}>
        <button type="button" className={styles.navBtn} onClick={() => shiftDate(-1)} aria-label="Previous day">
          <i className="bi bi-chevron-left" />
        </button>
        <input
          type="date"
          className={styles.dateInput}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button type="button" className={styles.navBtn} onClick={() => shiftDate(1)} aria-label="Next day">
          <i className="bi bi-chevron-right" />
        </button>
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}

      {loading ? (
        <div className={styles.empty}>Loading calendar…</div>
      ) : viewMode === 'rows' ? (
        <div className={styles.rowsList}>
          {rowsViewItems.length === 0 ? (
            <div className={styles.empty}>No slots match this day or search.</div>
          ) : (
            rowsViewItems.map(({ room, slot }) => (
              <div key={`${room.slug}-${slot.id}`} className={styles.rowItem}>
                <div className={styles.rowRoomLabel}>{room.name}</div>
                <div>{renderSlotCard(room, slot)}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={styles.roomsGrid}>
          {rooms.map((room) => {
            const slots = filteredRoomSlotsMap[room.slug] || [];
            return (
              <div key={room.slug} className={styles.roomColumn}>
                <h2 className={styles.roomHeader}>{room.name}</h2>
                <div className={styles.slotsStack}>
                  {slots.length === 0 ? (
                    <div className={styles.emptyColumnNote}>
                      No slots for this day. Manage from{' '}
                      <Link href={`/admin/manage-rooms/${room.slug}`} style={{ color: 'var(--gold-primary)' }}>
                        {room.name}
                      </Link>
                      .
                    </div>
                  ) : (
                    slots.map((slot) => renderSlotCard(room, slot))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.footerBar}>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.legendEmpty}`} /> No bookings
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.legendPartial}`} /> Booked
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.legendBlocked}`} /> Blocked
          </span>
        </div>
        <div className={styles.footerActions}>
          <button type="button" className={styles.icalBtn} onClick={downloadIcal}>
            <i className="bi bi-calendar-week" /> iCal
          </button>
          <button type="button" className={styles.printBtn} onClick={printCalendar}>
            <i className="bi bi-printer-fill" /> Print
          </button>
        </div>
      </div>

      <AdminBookSlotModal
        open={Boolean(bookingContext)}
        onClose={() => setBookingContext(null)}
        slot={bookingContext?.slot || null}
        room={bookingContext?.room || null}
        onBooked={async () => {
          setBookingContext(null);
          await fetchCalendarData(selectedDate);
        }}
      />

      {portalReady && selectedSlot
        ? createPortal(
            <div className={styles.modalOverlay} onClick={() => setSelectedSlot(null)} role="dialog" aria-modal="true">
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>
                    {selectedSlot.roomName} | {selectedSlot.start_time} - {selectedSlot.end_time}
                  </h3>
                  <button type="button" className={styles.closeBtn} onClick={() => setSelectedSlot(null)} aria-label="Close">
                    <i className="bi bi-x-lg" />
                  </button>
                </div>

                <div className={styles.modalSummary}>
                  <span>Capacity: {selectedSlot.capacity}</span>
                  <span>Booked: {selectedSlot.bookedPlayers}</span>
                  <span>Available: {selectedSlot.availableSeats}</span>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Booking #</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Players</th>
                        <th>Status</th>
                        <th>Tour</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSlot.bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.booking_number || booking.id}</td>
                          <td>{`${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown'}</td>
                          <td>{booking.phone || '—'}</td>
                          <td>{booking.email_address || '—'}</td>
                          <td>{booking.participants || booking.adults || 0}</td>
                          <td>{booking.status || 'booked'}</td>
                          <td>{booking.tour || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Link href="/admin/bookings" className={styles.bookingLink}>
                  Open bookings admin →
                </Link>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
