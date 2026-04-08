import styles from './RecentCustomers.module.css';

const dummyCustomers = [
  { id: 1, name: 'Ahmed Al-Rashid', phone: '+966501234567', email: 'ahmed@email.com', room: 'The Butcher', status: 'win', isChampion: false, date: '2024-01-15' },
  { id: 2, name: 'Sara Mohammed', phone: '+966507654321', email: 'sara@email.com', room: 'Sherlock', status: 'lose', isChampion: false, date: '2024-01-15' },
  { id: 3, name: 'Khalid Ibrahim', phone: '+966512345678', email: 'khalid@email.com', room: 'Lost City', status: 'champion', isChampion: true, date: '2024-01-14' },
  { id: 4, name: 'Fatima Hassan', phone: '+966598765432', email: 'fatima@email.com', room: 'VR Rooms', status: 'win', isChampion: false, date: '2024-01-14' },
  { id: 5, name: 'Omar Abdullah', phone: '+966511223344', email: 'omar@email.com', room: 'Mindshield', status: 'lose', isChampion: false, date: '2024-01-13' },
];

const statusColors = {
  win: '#4caf50',
  lose: '#f44336',
  champion: '#d4a84b',
};

export default function RecentCustomers() {
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
            {dummyCustomers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className={styles.customerName}>
                    {c.isChampion && <i className="bi bi-trophy-fill" style={{ color: '#d4a84b', marginRight: '6px' }}></i>}
                    {c.name}
                  </div>
                </td>
                <td className={styles.muted}>{c.phone}</td>
                <td>{c.room}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ background: `${statusColors[c.status]}22`, color: statusColors[c.status] }}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td className={styles.muted}>{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}