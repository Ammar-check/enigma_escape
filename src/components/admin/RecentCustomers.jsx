import styles from './RecentCustomers.module.css';

const statusColors = {
  win: '#4caf50',
  lose: '#f44336',
  champion: '#d4a84b',
};

export default function RecentCustomers({ customers = [] }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Customers</h3>
        <a href="/admin/customers" className={styles.viewAll}>View All →</a>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Room</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className={styles.customerName}>
                    {c.isChampion && <i className="bi bi-trophy-fill" style={{ color: '#d4a84b', marginRight: '6px' }}></i>}
                    {c.name}
                  </div>
                </td>
                <td className={styles.muted}>{c.phone}</td>
                <td>{c.status || '—'}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ background: `${(statusColors[c.status] || '#999')}22`, color: statusColors[c.status] || '#bbb' }}
                  >
                    {(c.status || 'unknown').toUpperCase()}
                  </span>
                </td>
                <td className={styles.muted}>{c.date}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.muted}>No recent customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}