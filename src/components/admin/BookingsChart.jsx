'use client';

import styles from './BookingsChart.module.css';

const fallbackData = [
  { day: 'Mon', bookings: 0 },
  { day: 'Tue', bookings: 0 },
  { day: 'Wed', bookings: 0 },
  { day: 'Thu', bookings: 0 },
  { day: 'Fri', bookings: 0 },
  { day: 'Sat', bookings: 0 },
  { day: 'Sun', bookings: 0 },
];

export default function BookingsChart({ data = fallbackData, total = 0, breakdown = [] }) {
  const chartData = data.length > 0 ? data : fallbackData;
  const max = Math.max(...chartData.map((d) => d.bookings), 1);
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Bookings This Week</h3>
        <span className={styles.total}>{total} total</span>
      </div>

      <div className={styles.chart}>
        {chartData.map((d) => (
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

      <div className={styles.breakdown}>
        {breakdown.map((r) => (
          <div key={r.room} className={styles.breakdownItem}>
            <span className={styles.breakdownDot} style={{ background: r.color }}></span>
            <span className={styles.breakdownRoom}>{r.room}</span>
            <span className={styles.breakdownCount}>{r.count}</span>
          </div>
        ))}
        {breakdown.length === 0 && <span className={styles.breakdownRoom}>No booking breakdown yet.</span>}
      </div>
    </div>
  );
}