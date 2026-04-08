'use client';

import styles from './page.module.css';
import StatCard from '@/components/admin/StatCard';
import RecentCustomers from '@/components/admin/RecentCustomers';
import BookingsChart from '@/components/admin/BookingsChart';
import VideoQueue from '@/components/admin/VideoQueue';

// dummy data for now — replace with Strapi API calls later
const stats = [
  { label: 'Total Customers', value: '1,284', icon: 'bi-people-fill', change: '+12% this month' },
  { label: 'Bookings Today', value: '24', icon: 'bi-calendar-check-fill', change: '+3 from yesterday' },
  { label: 'Champions', value: '87', icon: 'bi-trophy-fill', change: 'All rooms completed' },
  { label: 'Video Pending', value: '12', icon: 'bi-camera-video-fill', change: '3 sent today' },
];

export default function AdminDashboard() {
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Dashboard</h1>
          <p className={styles.dashSubtitle}>Welcome back — here's what's happening today</p>
        </div>
        <div className={styles.dashDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Middle Row */}
      <div className={styles.middleRow}>
        <BookingsChart />
        <VideoQueue />
      </div>

      {/* Recent Customers */}
      <RecentCustomers />
    </div>
  );
}