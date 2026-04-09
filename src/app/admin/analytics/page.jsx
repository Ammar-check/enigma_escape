'use client';

import { useState } from 'react';
import styles from './anylatics.module.css';

const monthlyData = [
  { month: 'Aug', customers: 45, bookings: 52, videos: 18 },
  { month: 'Sep', customers: 62, bookings: 71, videos: 24 },
  { month: 'Oct', customers: 88, bookings: 95, videos: 31 },
  { month: 'Nov', customers: 74, bookings: 83, videos: 27 },
  { month: 'Dec', customers: 110, bookings: 125, videos: 45 },
  { month: 'Jan', customers: 95, bookings: 108, videos: 38 },
];

const roomData = [
  { room: 'The Butcher', bookings: 98, wins: 42, losses: 56, color: '#e53935' },
  { room: 'Sherlock', bookings: 85, wins: 51, losses: 34, color: '#8e24aa' },
  { room: 'Lost City', bookings: 76, wins: 38, losses: 38, color: '#1e88e5' },
  { room: 'VR Rooms', bookings: 112, wins: 89, losses: 23, color: '#00acc1' },
  { room: 'Mindshield', bookings: 54, wins: 21, losses: 33, color: '#d4a84b' },
  { room: 'Outdoor Escape', bookings: 41, wins: 28, losses: 13, color: '#43a047' },
];

const maxBookings = Math.max(...monthlyData.map((d) => d.bookings));
const maxRoomBookings = Math.max(...roomData.map((d) => d.bookings));

export default function AnalyticsPage() {
  const [activeMetric, setActiveMetric] = useState('bookings');

  const totalCustomers = 1284;
  const totalBookings = monthlyData.reduce((a, b) => a + b.bookings, 0);
  const totalVideosRequested = 183;
  const totalVideosSent = 141;
  const totalChampions = 87;

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
                  strokeDasharray={`${(totalVideosSent / totalVideosRequested) * 220} 220`}
                  strokeDashoffset="55"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className={styles.donutCenter}>
                <span className={styles.donutPct}>
                  {Math.round((totalVideosSent / totalVideosRequested) * 100)}%
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
                <div className={styles.langFillAr} style={{ width: '63%' }}></div>
                <div className={styles.langFillEn} style={{ width: '37%' }}></div>
              </div>
              <div className={styles.langLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#d4a84b' }}></span>
                  <span>Arabic — 63%</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#1e88e5' }}></span>
                  <span>English — 37%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}