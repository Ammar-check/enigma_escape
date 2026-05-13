'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { ROOM_MAP, VR_ALL_SLOT_SLUGS, VR_CANONICAL_SLUG } from '@/data/roomCatalog';
import { saveRoomSlot } from '@/lib/adminRoomSlotSave';
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

  const loadData = async (dateOverride) => {
    if (!roomId) return;
    const dateForQuery = dateOverride ?? selectedDate;
    setLoading(true);
    const isUnifiedVr = roomId === VR_CANONICAL_SLUG;
    const slotSlugFilter = isUnifiedVr
      ? supabase
          .from('room_slots')
          .select('*')
          .in('room_slug', VR_ALL_SLOT_SLUGS)
          .eq('slot_date', dateForQuery)
          .order('start_time', { ascending: true })
      : supabase
          .from('room_slots')
          .select('*')
          .eq('room_slug', roomId)
          .eq('slot_date', dateForQuery)
          .order('start_time', { ascending: true });

    const bookingTourFilter = isUnifiedVr
      ? [
          'tour.ilike.%VR Room%',
          'tour.ilike.%vr room%',
          'tour.ilike.%vr-room%',
        ].join(',')
      : `tour.ilike.%${room?.name || ''}%,tour.ilike.%${roomId}%`;

    const [{ data: slotData, error: slotError }, { data: bookingData, error: bookingError }] = await Promise.all([
      slotSlugFilter,
      supabase
        .from('bookings')
        .select('id, first_name, last_name, participants, adults, start_at, end_at, status, phone, email_address, tour')
        .or(bookingTourFilter)
        .gte('start_at', `${dateForQuery}T00:00:00`)
        .lt('start_at', `${dateForQuery}T23:59:59`),
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
    const result = await saveRoomSlot({
      supabase,
      form,
      roomId,
      room,
      VR_CANONICAL_SLUG,
      VR_ALL_SLOT_SLUGS,
      setMessage,
    });
    if (!result.ok) return;
    const refreshDate = result.refreshDate ?? selectedDate;
    setSelectedDate((prev) => (result.refreshDate && String(result.refreshDate).length >= 10 ? result.refreshDate : prev));
    setModalOpen(false);
    setEditingSlot(null);
    await loadData(refreshDate);
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
        <label htmlFor="room-slots-date">Date:</label>
        <input
          id="room-slots-date"
          type="date"
          className={styles.dateInput}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
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
        <h2 className={styles.sectionTitle}>Room Booking History</h2>
        <p className={styles.sectionSubtitle}>
          {room.name} — customer bookings for {selectedDate}.
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
        defaultSlotDate={selectedDate}
      />
    </div>
  );
}
