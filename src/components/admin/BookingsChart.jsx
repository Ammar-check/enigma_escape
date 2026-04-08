'use client';

import styles from './BookingsChart.module.css';

const data = [
  { day: 'Mon', bookings: 8 },
  { day: 'Tue', bookings: 12 },
  { day: 'Wed', bookings: 6 },
  { day: 'Thu', bookings: 15 },
  { day: 'Fri', bookings: 20 },
  { day: 'Sat', bookings: 24 },
  { day: 'Sun', bookings: 18 },
];

const max = Math.max(...data.map(d => d.bookings));

export default function BookingsChart() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Bookings This Week</h3>
        <span className={styles.total}>103 total</span>
      </div>

      <div className={styles.chart}>
        {data.map((d) => (
          <div key={d.day} className={styles.barGroup}>
            <span className={styles.barValue}>{d.bookings}</span>
            <div className={styles.barWrapper}>
              <div
                className={styles.bar}
                style={{ height: `${(d.bookings / max) * 100}%` }}
              ></div>
            </div>
            <span className={styles.barLabel}>{d.day}</span>
          </div>
        ))}
      </div>

      {/* Room breakdown */}
      <div className={styles.breakdown}>
        {[
          { room: 'Butcher', count: 28, color: '#e53935' },
          { room: 'Sherlock', count: 22, color: '#8e24aa' },
          { room: 'Lost City', count: 19, color: '#1e88e5' },
          { room: 'VR', count: 24, color: '#00acc1' },
          { room: 'Mindshield', count: 10, color: '#d4a84b' },
        ].map((r) => (
          <div key={r.room} className={styles.breakdownItem}>
            <span className={styles.breakdownDot} style={{ background: r.color }}></span>
            <span className={styles.breakdownRoom}>{r.room}</span>
            <span className={styles.breakdownCount}>{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}