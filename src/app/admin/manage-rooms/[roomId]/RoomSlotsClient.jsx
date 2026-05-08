'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { ROOM_MAP } from '@/data/roomCatalog';
import SlotFormModal from '@/components/admin/rooms/SlotFormModal';

export default function RoomSlotsClient({ roomId }) {
  const room = ROOM_MAP[roomId];
  const getDatePart = (value) => String(value || '').slice(0, 10);
  const getTimePart = (value) => String(value || '').slice(11, 16);
  const isInSlotRange = (time, start, end) => Boolean(time && start && end && time >= start.slice(0, 5) && time < end.slice(0, 5));

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [message, setMessage] = useState('');

  const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadData = async () => {
    if (!roomId) return;
    setLoading(true);
    const [{ data: slotData, error: slotError }, { data: bookingData, error: bookingError }] = await Promise.all([
      supabase
        .from('room_slots')
        .select('*')
        .eq('room_slug', roomId)
        .eq('slot_date', selectedDate)
        .order('start_time', { ascending: true }),
      supabase
        .from('bookings')
        .select('id, first_name, last_name, participants, adults, start_at, end_at, status, phone, email_address, tour')
        .or(`tour.ilike.%${room?.name || ''}%,tour.ilike.%${roomId}%`)
        .gte('start_at', `${selectedDate}T00:00:00`)
        .lt('start_at', `${selectedDate}T23:59:59`),
    ]);

    if (slotError) setMessage(`Slots load failed: ${slotError.message}`);
    if (bookingError) setMessage(`Bookings load failed: ${bookingError.message}`);
    setSlots(slotData || []);
    setBookings(bookingData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, selectedDate]);

  const bookingsBySlot = useMemo(() => {
    const map = {};
    slots.forEach((slot) => {
      map[slot.id] = bookings.filter((booking) => {
        if (!booking.start_at) return false;
        const bookingDate = getDatePart(booking.start_at);
        const bookingTime = getTimePart(booking.start_at);
        return bookingDate === slot.slot_date && isInSlotRange(bookingTime, slot.start_time, slot.end_time);
      });
    });
    return map;
  }, [slots, bookings]);

  const roomBookingStats = useMemo(() => {
    const uniqueCustomers = new Set();
    let totalPlayers = 0;
    bookings.forEach((booking) => {
      const key = (booking.email_address || booking.phone || `${booking.first_name || ''}-${booking.last_name || ''}`).trim();
      if (key) uniqueCustomers.add(key.toLowerCase());
      totalPlayers += Number(booking.participants || booking.adults || 0);
    });
    return {
      totalBookings: bookings.length,
      uniqueCustomers: uniqueCustomers.size,
      totalPlayers,
    };
  }, [bookings]);

  const saveSlot = async (form) => {
    if (!form.slot_date || !form.start_time || !form.end_time) {
      setMessage('Please select date, start time, and end time.');
      return;
    }
    if (form.end_time <= form.start_time) {
      setMessage('End time must be later than start time.');
      return;
    }

    const payload = {
      room_slug: roomId,
      room_name: room?.name || roomId,
      slot_date: form.slot_date,
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

    if (form.id) {
      const { error } = await supabase.from('room_slots').update(payload).eq('id', form.id);
      if (error) {
        setMessage(`Update failed: ${error.message}`);
        return;
      }
      setMessage('Slot updated.');
    } else {
      if (form.apply_daily_until && form.repeat_until_date) {
        if (form.repeat_until_date < form.slot_date) {
          setMessage('Repeat until date must be same or after slot date.');
          return;
        }

        const { data: existingRows, error: existingError } = await supabase
          .from('room_slots')
          .select('slot_date,start_time,end_time')
          .eq('room_slug', roomId)
          .eq('start_time', form.start_time)
          .eq('end_time', form.end_time)
          .gte('slot_date', form.slot_date)
          .lte('slot_date', form.repeat_until_date);

        if (existingError) {
          setMessage(`Create failed: ${existingError.message}`);
          return;
        }

        const existingDates = new Set((existingRows || []).map((row) => row.slot_date));
        const start = new Date(form.slot_date);
        const end = new Date(form.repeat_until_date);
        const rowsToInsert = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const slotDate = toIsoDate(d);
          if (existingDates.has(slotDate)) continue;
          rowsToInsert.push({
            ...payload,
            slot_date: slotDate,
          });
        }

        if (rowsToInsert.length > 0) {
          const { error } = await supabase.from('room_slots').insert(rowsToInsert);
          if (error) {
            setMessage(`Create failed: ${error.message}`);
            return;
          }
          const skipped = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1 - rowsToInsert.length, 0);
          setMessage(`Added ${rowsToInsert.length} slots${skipped > 0 ? `, skipped ${skipped} existing` : ''}.`);
        } else {
          setMessage('No new slots added (all dates already had this slot).');
        }
      } else {
        const { error } = await supabase.from('room_slots').insert(payload);
        if (error) {
          setMessage(`Create failed: ${error.message}`);
          return;
        }
        setMessage('Slot added.');
      }
    }
    setModalOpen(false);
    setEditingSlot(null);
    await loadData();
  };

  const removeSlot = async (slotId) => {
    if (!confirm('Delete this slot?')) return;
    const { error } = await supabase.from('room_slots').delete().eq('id', slotId);
    if (error) {
      setMessage(`Delete failed: ${error.message}`);
      return;
    }
    setMessage('Slot deleted.');
    await loadData();
  };

  const toggleBlocked = async (slot) => {
    const { error } = await supabase
      .from('room_slots')
      .update({ is_blocked: !slot.is_blocked })
      .eq('id', slot.id);
    if (error) {
      setMessage(`Block toggle failed: ${error.message}`);
      return;
    }
    await loadData();
  };

  if (!room) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Room not found.</p>
        <Link href="/admin/manage-rooms" className={styles.linkBack}>Back to rooms</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{room.name} Slots</h1>
          <p className={styles.subtitle}>Manage slot timeframes, block bookings, and edit slot setup.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/manage-rooms" className={styles.linkBack}>All Rooms</Link>
          <button className={styles.primaryBtn} onClick={() => { setEditingSlot(null); setModalOpen(true); }}>
            <i className="bi bi-plus-circle-fill"></i> Add Slot
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <label>Tour:</label>
        <span className={styles.tourName}>{room.name}</span>
        <label>Date:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {loading ? (
        <div className={styles.empty}>Loading slots...</div>
      ) : slots.length === 0 ? (
        <div className={styles.empty}>No slots yet for this date.</div>
      ) : (
        <div className={styles.slotList}>
          {slots.map((slot) => {
            const slotBookings = bookingsBySlot[slot.id] || [];
            const bookedPlayers = slotBookings.reduce((sum, booking) => sum + Number(booking.participants || booking.adults || 0), 0);
            return (
              <div key={slot.id} className={styles.slotCard}>
                <div className={styles.slotTop}>
                  <div>
                    <h3 className={styles.slotTitle}>{slot.start_time} - {slot.end_time}</h3>
                    <p className={styles.slotMeta}>Booked players: {bookedPlayers} / {slot.capacity} (Available: {Math.max(Number(slot.capacity || 0) - bookedPlayers, 0)})</p>
                    {slot.is_blocked && <p className={styles.blocked}>Blocked {slot.block_reason ? `: ${slot.block_reason}` : ''}</p>}
                  </div>
                  <div className={styles.rowActions}>
                    <button className={styles.smallBtn} onClick={() => toggleBlocked(slot)}>{slot.is_blocked ? 'Unblock' : 'Block'}</button>
                    <button className={styles.smallBtn} onClick={() => { setEditingSlot(slot); setModalOpen(true); }}>Edit</button>
                    <button className={styles.smallDeleteBtn} onClick={() => removeSlot(slot.id)}>Delete</button>
                  </div>
                </div>

                <div className={styles.bookingTableWrap}>
                  <table className={styles.bookingTable}>
                    <thead>
                      <tr>
                        <th>Booking</th>
                        <th>Customer</th>
                        <th>Players</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slotBookings.length === 0 ? (
                        <tr><td colSpan={4} className={styles.noBookings}>No bookings in this slot.</td></tr>
                      ) : (
                        slotBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{`${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown'}</td>
                            <td>{booking.participants || booking.adults || 0}</td>
                            <td>{booking.status || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.detailsSection}>
        <h2 className={styles.sectionTitle}>Room Booking Details</h2>
        <p className={styles.sectionSubtitle}>
          {room.name} - {selectedDate} customer bookings summary and details.
        </p>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span>Total bookings</span>
            <strong>{roomBookingStats.totalBookings}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Total customers</span>
            <strong>{roomBookingStats.uniqueCustomers}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Total players</span>
            <strong>{roomBookingStats.totalPlayers}</strong>
          </div>
        </div>

        <div className={styles.detailsTableWrap}>
          <table className={styles.detailsTable}>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Players</th>
                <th>Start Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.noBookings}>No customer bookings found for this room on selected date.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{`${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown'}</td>
                    <td>{booking.email_address || '—'}</td>
                    <td>{booking.phone || '—'}</td>
                    <td>{booking.participants || booking.adults || 0}</td>
                    <td>{booking.start_at ? new Date(booking.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{booking.status || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SlotFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSlot(null); }}
        onSave={saveSlot}
        initialData={editingSlot}
      />
    </div>
  );
}
