'use client';

import { useMemo, useState, useEffect } from 'react';
import styles from './anylatics.module.css';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [activeMetric, setActiveMetric] = useState('bookings');
  const [monthlyData, setMonthlyData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [totals, setTotals] = useState({
    totalCustomers: 0,
    totalBookings: 0,
    totalVideosRequested: 0,
    totalVideosSent: 0,
    totalChampions: 0,
    arabicCount: 0,
    englishCount: 0,
  });
  const maxBookings = useMemo(() => Math.max(...monthlyData.map((d) => d.bookings), 1), [monthlyData]);
  const maxRoomBookings = useMemo(() => Math.max(...roomData.map((d) => d.bookings), 1), [roomData]);

  useEffect(() => {
    const loadAnalytics = async () => {
      const monthBuckets = [];
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthBuckets.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          month: d.toLocaleDateString('en-US', { month: 'short' }),
          customers: 0,
          bookings: 0,
          videos: 0,
        });
      }

      const [customersRes, bookingsRes] = await Promise.all([
        supabase.from('customers').select('id, created_at, status, is_champion, video_requested, video_sent, language, rooms'),
        supabase.from('bookings').select('id, created_at, start_at, tour, status'),
      ]);

      const customers = customersRes.data || [];
      const bookings = bookingsRes.data || [];

      const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, { ...bucket }]));
      customers.forEach((customer) => {
        if (!customer.created_at) return;
        const dt = new Date(customer.created_at);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        const bucket = monthMap.get(key);
        if (bucket) {
          bucket.customers += 1;
          if (customer.video_requested) bucket.videos += 1;
        }
      });
      bookings.forEach((booking) => {
        const when = booking.start_at || booking.created_at;
        if (!when) return;
        const dt = new Date(when);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        const bucket = monthMap.get(key);
        if (bucket) bucket.bookings += 1;
      });

      const roomStats = {};
      bookings.forEach((booking) => {
        const room = booking.tour || 'Unknown';
        if (!roomStats[room]) roomStats[room] = { room, bookings: 0, wins: 0, losses: 0 };
        roomStats[room].bookings += 1;
        if (booking.status === 'checked_in' || booking.status === 'completed' || booking.status === 'win' || booking.status === 'booked') {
          roomStats[room].wins += 1;
        } else {
          roomStats[room].losses += 1;
        }
      });

      const palette = ['#e53935', '#8e24aa', '#1e88e5', '#00acc1', '#d4a84b', '#43a047', '#ff7043', '#5c6bc0'];
      const roomList = Object.values(roomStats)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 8)
        .map((room, index) => ({ ...room, color: palette[index % palette.length] }));

      const arabicCount = customers.filter((customer) => String(customer.language || '').toLowerCase().startsWith('ar')).length;
      const englishCount = customers.filter((customer) => String(customer.language || '').toLowerCase().startsWith('en')).length;

      setTotals({
        totalCustomers: customers.length,
        totalBookings: bookings.length,
        totalVideosRequested: customers.filter((customer) => customer.video_requested).length,
        totalVideosSent: customers.filter((customer) => customer.video_sent).length,
        totalChampions: customers.filter((customer) => customer.is_champion || customer.status === 'champion').length,
        arabicCount,
        englishCount,
      });
      setMonthlyData(monthBuckets.map((bucket) => monthMap.get(bucket.key) || bucket));
      setRoomData(roomList);
    };

    loadAnalytics();
  }, []);

  const { totalCustomers, totalBookings, totalVideosRequested, totalVideosSent, totalChampions, arabicCount, englishCount } = totals;

  const exportCSV = () => {
    const headers = ['Month', 'Customers', 'Bookings', 'Videos'];
    const rows = monthlyData.map((d) => [d.month, d.customers, d.bookings, d.videos]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    a.click();
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSub}>Overview of all performance metrics</p>
        </div>
        <button className={styles.exportBtn} onClick={exportCSV}>
          <i className="bi bi-download"></i> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(212,168,75,0.1)', color: '#d4a84b' }}>
            <i className="bi bi-people-fill"></i>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{totalCustomers.toLocaleString()}</span>
            <span className={styles.kpiLabel}>Total Customers</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(30,136,229,0.1)', color: '#1e88e5' }}>
            <i className="bi bi-calendar-check-fill"></i>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{totalBookings}</span>
            <span className={styles.kpiLabel}>Total Bookings</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(76,175,80,0.1)', color: '#4caf50' }}>
            <i className="bi bi-trophy-fill"></i>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{totalChampions}</span>
            <span className={styles.kpiLabel}>Champions</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(0,191,255,0.1)', color: '#00bfff' }}>
            <i className="bi bi-camera-video-fill"></i>
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{totalVideosSent}<span className={styles.kpiSub}>/{totalVideosRequested}</span></span>
            <span className={styles.kpiLabel}>Videos Sent</span>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Monthly Overview</h3>
          <div className={styles.metricTabs}>
            {['bookings', 'customers', 'videos'].map((m) => (
              <button
                key={m}
                className={`${styles.metricTab} ${activeMetric === m ? styles.metricActive : ''}`}
                onClick={() => setActiveMetric(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.barChart}>
          {monthlyData.map((d) => (
            <div key={d.month} className={styles.barGroup}>
              <span className={styles.barValue}>{d[activeMetric]}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    height: `${(d[activeMetric] / maxBookings) * 100}%`,
                    background: activeMetric === 'bookings'
                      ? 'linear-gradient(to top, #d4a84b, rgba(212,168,75,0.4))'
                      : activeMetric === 'customers'
                      ? 'linear-gradient(to top, #1e88e5, rgba(30,136,229,0.4))'
                      : 'linear-gradient(to top, #00bfff, rgba(0,191,255,0.4))',
                  }}
                ></div>
              </div>
              <span className={styles.barLabel}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>

        {/* Room Performance */}
        <div className={styles.roomCard}>
          <h3 className={styles.chartTitle}>Bookings by Room</h3>
          <div className={styles.roomList}>
            {roomData.map((r) => (
              <div key={r.room} className={styles.roomRow}>
                <div className={styles.roomRowHeader}>
                  <span className={styles.roomDot} style={{ background: r.color }}></span>
                  <span className={styles.roomName}>{r.room}</span>
                  <span className={styles.roomCount}>{r.bookings}</span>
                </div>
                <div className={styles.roomBar}>
                  <div
                    className={styles.roomBarFill}
                    style={{
                      width: `${(r.bookings / maxRoomBookings) * 100}%`,
                      background: r.color,
                    }}
                  ></div>
                </div>
                <div className={styles.roomStats}>
                  <span style={{ color: '#4caf50' }}>
                    <i className="bi bi-check-lg"></i> {r.wins} wins
                  </span>
                  <span style={{ color: '#f44336' }}>
                    <i className="bi bi-x-lg"></i> {r.losses} losses
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {Math.round((r.wins / r.bookings) * 100)}% win rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>

          {/* Video stats */}
          <div className={styles.miniCard}>
            <h3 className={styles.chartTitle}>Video Stats</h3>
            <div className={styles.donutWrapper}>
              <svg viewBox="0 0 100 100" className={styles.donut}>
                <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="35" fill="none"
                  stroke="#4caf50" strokeWidth="12"
                  strokeDasharray={`${(totalVideosSent / Math.max(totalVideosRequested, 1)) * 220} 220`}
                  strokeDashoffset="55"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className={styles.donutCenter}>
                <span className={styles.donutPct}>
                  {Math.round((totalVideosSent / Math.max(totalVideosRequested, 1)) * 100)}%
                </span>
                <span className={styles.donutLabel}>Sent</span>
              </div>
            </div>
            <div className={styles.videoLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#4caf50' }}></span>
                <span>Sent ({totalVideosSent})</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'rgba(255,255,255,0.1)' }}></span>
                <span>Pending ({totalVideosRequested - totalVideosSent})</span>
              </div>
            </div>
          </div>

          {/* Language split */}
          <div className={styles.miniCard}>
            <h3 className={styles.chartTitle}>Language Split</h3>
            <div className={styles.langSplit}>
              <div className={styles.langBar}>
                <div
                  className={styles.langFillAr}
                  style={{ width: `${Math.round((arabicCount / Math.max(arabicCount + englishCount, 1)) * 100)}%` }}
                ></div>
                <div
                  className={styles.langFillEn}
                  style={{ width: `${Math.round((englishCount / Math.max(arabicCount + englishCount, 1)) * 100)}%` }}
                ></div>
              </div>
              <div className={styles.langLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#d4a84b' }}></span>
                  <span>
                    Arabic — {Math.round((arabicCount / Math.max(arabicCount + englishCount, 1)) * 100)}%
                  </span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#1e88e5' }}></span>
                  <span>
                    English — {Math.round((englishCount / Math.max(arabicCount + englishCount, 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}