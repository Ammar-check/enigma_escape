'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { ROOM_CATALOG, mergeVrRoomSlugForAdminStats } from '@/data/roomCatalog';
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
        const key = mergeVrRoomSlugForAdminStats(slot.room_slug);
        if (!stats[key]) stats[key] = { total: 0, blocked: 0 };
        stats[key].total += 1;
        if (slot.is_blocked) stats[key].blocked += 1;
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
    </div>
  );
}
