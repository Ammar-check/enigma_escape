'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { ROOM_CATALOG } from '@/data/roomCatalog';
import RoomCard from '@/components/admin/rooms/RoomCard';

export default function ManageRoomsPage() {
  const [filterTour, setFilterTour] = useState('all');
  const [slotStats, setSlotStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('room_slots')
        .select('room_slug, is_blocked');
      if (error) {
        console.warn('room_slots table not found yet, showing empty stats.');
        setLoading(false);
        return;
      }
      const stats = {};
      (data || []).forEach((slot) => {
        if (!stats[slot.room_slug]) stats[slot.room_slug] = { total: 0, blocked: 0 };
        stats[slot.room_slug].total += 1;
        if (slot.is_blocked) stats[slot.room_slug].blocked += 1;
      });
      setSlotStats(stats);
      setLoading(false);
    };
    loadStats();
  }, []);

  const rooms = useMemo(
    () => ROOM_CATALOG.filter((room) => filterTour === 'all' || room.type === filterTour),
    [filterTour]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Rooms</h1>
        <p className={styles.subtitle}>
          Select any room to manage daily timeframes, block slots, and edit bookings.
        </p>
      </div>

      <div className={styles.filterRow}>
        <label className={styles.filterLabel}>Filter Tour:</label>
        <select className={styles.select} value={filterTour} onChange={(e) => setFilterTour(e.target.value)}>
          <option value="all">All</option>
          <option value="escape">Escape</option>
          <option value="vr">VR Room</option>
        </select>
      </div>

      <div className={styles.grid}>
        {rooms.map((room) => {
          const stats = slotStats[room.slug] || { total: 0, blocked: 0 };
          return (
            <RoomCard
              key={room.slug}
              room={room}
              slotCount={stats.total}
              blockedCount={stats.blocked}
            />
          );
        })}
      </div>

      {!loading && rooms.length === 0 && (
        <div className={styles.empty}>No rooms found for this filter.</div>
      )}
      {loading && (
        <div className={styles.empty}>Loading room slots...</div>
      )}
      <div className={styles.noteBox}>
        <h3 className={styles.noteTitle}>VR Rooms</h3>
        <p className={styles.noteText}>
          VR Room 1 to VR Room 9 are included. Open any VR card to add/edit time slots,
          block specific slots, and manage booking visibility.
        </p>
      </div>
      <div className={styles.helpGrid}>
        <div className={styles.helpCard}>
          <h4>BOOK NOW</h4>
          <p>Each room card opens a dedicated slot management page.</p>
        </div>
        <div className={styles.helpCard}>
          <h4>Slots</h4>
          <p>Add multiple timeframes per day and set seat capacity.</p>
        </div>
        <div className={styles.helpCard}>
          <h4>Block Booking</h4>
          <p>Mark any slot blocked for maintenance or private events.</p>
        </div>
      </div>
    </div>
  );
}
