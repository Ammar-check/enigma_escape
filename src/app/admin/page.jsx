'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import StatCard from '@/components/admin/StatCard';
import RecentCustomers from '@/components/admin/RecentCustomers';
import BookingsChart from '@/components/admin/BookingsChart';
import VideoQueue from '@/components/admin/VideoQueue';
import { supabase } from '@/lib/supabase';

const getDayKey = (dateValue) =>
  new Date(dateValue).toLocaleDateString('en-US', { weekday: 'short' });

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [videoQueue, setVideoQueue] = useState([]);
  const [bookingsWeekly, setBookingsWeekly] = useState([]);
  const [bookingsTotalWeek, setBookingsTotalWeek] = useState(0);
  const [bookingsByTour, setBookingsByTour] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const todayIso = new Date().toISOString().slice(0, 10);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      const weekStartIso = weekStart.toISOString();

      const [
        totalCustomersRes,
        bookingsTodayRes,
        championsRes,
        videoPendingRes,
        recentCustomersRes,
        videoQueueRes,
        weeklyBookingsRes,
      ] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('start_at', `${todayIso}T00:00:00`).lt('start_at', `${todayIso}T23:59:59`),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('is_champion', true),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('video_requested', true).eq('video_sent', false),
        supabase.from('customers').select('id, full_name, first_name, last_name, primary_phone, phone_mobile, status, is_champion, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('customers').select('id, full_name, first_name, last_name, rooms, video_sent, video_requested, last_visit').eq('video_requested', true).order('last_visit', { ascending: false }).limit(8),
        supabase.from('bookings').select('id, start_at, tour').gte('start_at', weekStartIso),
      ]);

      setStats([
        { label: 'Total Customers', value: `${totalCustomersRes.count || 0}`, icon: 'bi-people-fill', change: 'Live from customers table' },
        { label: 'Bookings Today', value: `${bookingsTodayRes.count || 0}`, icon: 'bi-calendar-check-fill', change: 'Using booking start time' },
        { label: 'Champions', value: `${championsRes.count || 0}`, icon: 'bi-trophy-fill', change: 'From customer status flags' },
        { label: 'Video Pending', value: `${videoPendingRes.count || 0}`, icon: 'bi-camera-video-fill', change: 'Requested but not sent' },
      ]);

      const recentMapped = (recentCustomersRes.data || []).map((customer) => ({
        id: customer.id,
        name: customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown',
        phone: customer.primary_phone || customer.phone_mobile || '—',
        status: customer.status || 'win',
        isChampion: Boolean(customer.is_champion),
        date: customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—',
      }));
      setRecentCustomers(recentMapped);

      const queueMapped = (videoQueueRes.data || []).map((customer) => {
        const roomsArray = Array.isArray(customer.rooms) ? customer.rooms : [];
        return {
          id: customer.id,
          name: customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown',
          room: roomsArray.join(', ') || '—',
          time: customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : '—',
          sent: Boolean(customer.video_sent),
        };
      });
      setVideoQueue(queueMapped);

      const weekdayBuckets = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reduce((acc, day) => {
        acc[day] = 0;
        return acc;
      }, {});
      const tourBuckets = {};
      (weeklyBookingsRes.data || []).forEach((booking) => {
        if (booking.start_at) {
          const day = getDayKey(booking.start_at);
          if (weekdayBuckets[day] !== undefined) weekdayBuckets[day] += 1;
        }
        const tour = booking.tour || 'Unknown';
        tourBuckets[tour] = (tourBuckets[tour] || 0) + 1;
      });
      setBookingsWeekly(Object.entries(weekdayBuckets).map(([day, bookings]) => ({ day, bookings })));
      setBookingsTotalWeek((weeklyBookingsRes.data || []).length);
      setBookingsByTour(
        Object.entries(tourBuckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([room, count], index) => {
            const palette = ['#e53935', '#8e24aa', '#1e88e5', '#00acc1', '#d4a84b', '#4caf50'];
            return { room, count, color: palette[index % palette.length] };
          })
      );
    };

    loadDashboard();
  }, []);

  const computedStats = useMemo(() => stats, [stats]);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Dashboard</h1>
          <p className={styles.dashSubtitle}>Welcome back — heres whats happening today</p>
        </div>
        <div className={styles.dashDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {computedStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Middle Row */}
      <div className={styles.middleRow}>
        <BookingsChart data={bookingsWeekly} total={bookingsTotalWeek} breakdown={bookingsByTour} />
        <VideoQueue videos={videoQueue} />
      </div>

      {/* Recent Customers */}
      <RecentCustomers customers={recentCustomers} />
    </div>
  );
}