'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { ROOM_CATALOG } from '@/data/roomCatalog';

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
  'vr-room-1': ['vr room', 'vr room 1'],
  'vr-room-2': ['vr room', 'vr room 2'],
  'vr-room-3': ['vr room', 'vr room 3'],
  'vr-room-4': ['vr room', 'vr room 4'],
  'vr-room-5': ['vr room', 'vr room 5'],
  'vr-room-6': ['vr room', 'vr room 6'],
  'vr-room-7': ['vr room', 'vr room 7'],
  'vr-room-8': ['vr room', 'vr room 8'],
  'vr-room-9': ['vr room', 'vr room 9'],
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

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [roomSlotsMap, setRoomSlotsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

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
        const room = rooms.find((item) => item.slug === slot.room_slug);
        if (!room) return;
        const slotBookings = safeBookings.filter((booking) => {
          if (!booking.start_at) return false;
          const bookingDate = getDatePart(booking.start_at);
          const bookingTime = getTimePart(booking.start_at);
          return bookingDate === slot.slot_date && isInSlotRange(bookingTime, slot.start_time, slot.end_time) && isBookingForRoom(booking, room);
        });
        const bookedPlayers = slotBookings.reduce(
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
          bookingsCount: slotBookings.length,
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendar Sync</h1>
          <p className={styles.subtitle}>All rooms, all slots, and booking details synced with backend.</p>
        </div>
        <button className={styles.printBtn} onClick={printCalendar}>
          <i className="bi bi-printer-fill"></i> Print Calendar
        </button>
      </div>

      <div className={styles.controls}>
        <button className={styles.controlBtn} onClick={() => shiftDate(-1)}>
          <i className="bi bi-chevron-left"></i> Previous
        </button>
        <input
          type="date"
          className={styles.dateInput}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button className={styles.controlBtn} onClick={() => shiftDate(1)}>
          Next <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {loading ? (
        <div className={styles.empty}>Loading calendar...</div>
      ) : (
        <div className={styles.roomsGrid}>
          {rooms.map((room) => {
            const slots = roomSlotsMap[room.slug] || [];
            return (
              <div key={room.slug} className={styles.roomColumn}>
                <h3 className={styles.roomTitle}>{room.name}</h3>
                {slots.length === 0 ? (
                  <div className={styles.noSlots}>No slots for this date</div>
                ) : (
                  slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      className={`${styles.slotCard} ${slot.isFull ? styles.slotFull : ''}`}
                      onClick={() => {
                        if (slot.bookingsCount > 0) setSelectedSlot(slot);
                      }}
                    >
                      <div className={styles.slotTime}>{slot.start_time} - {slot.end_time}</div>
                      <div className={styles.slotMeta}>{slot.bookingsCount} booked</div>
                      <div className={styles.slotMeta}>{slot.availableSeats} available</div>
                      {slot.isFull ? <div className={styles.slotFlag}>FULL</div> : null}
                    </button>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSlot(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {selectedSlot.roomName} | {selectedSlot.start_time} - {selectedSlot.end_time}
              </h3>
              <button className={styles.closeBtn} onClick={() => setSelectedSlot(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className={styles.modalSummary}>
              <span>Capacity: {selectedSlot.capacity}</span>
              <span>Booked Players: {selectedSlot.bookedPlayers}</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
