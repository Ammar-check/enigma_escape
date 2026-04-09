'use client';

import { useState } from 'react';
import styles from './page.module.css';

const dummyBookings = [
  { id: 1, name: 'Ahmed Al-Rashid', phone: '+966501234567', email: 'ahmed@email.com', room: 'Butcher', date: '2024-01-15', time: '2:00 PM', players: 4, source: 'bookeo', status: 'confirmed', whatsappSent: true, emailSent: true },
  { id: 2, name: 'Sara Mohammed', phone: '+966507654321', email: 'sara@email.com', room: 'Sherlock', date: '2024-01-15', time: '3:30 PM', players: 3, source: 'walkin', status: 'confirmed', whatsappSent: false, emailSent: false },
  { id: 3, name: 'Khalid Ibrahim', phone: '+966512345678', email: 'khalid@email.com', room: 'Lost City', date: '2024-01-15', time: '5:00 PM', players: 6, source: 'bookeo', status: 'completed', whatsappSent: true, emailSent: true },
  { id: 4, name: 'Fatima Hassan', phone: '+966598765432', email: 'fatima@email.com', room: 'VR Rooms', date: '2024-01-16', time: '11:00 AM', players: 2, source: 'bookeo', status: 'confirmed', whatsappSent: true, emailSent: false },
  { id: 5, name: 'Omar Abdullah', phone: '+966511223344', email: 'omar@email.com', room: 'Mindshield', date: '2024-01-16', time: '1:00 PM', players: 5, source: 'walkin', status: 'cancelled', whatsappSent: false, emailSent: false },
  { id: 6, name: 'Layla Al-Saud', phone: '+966522334455', email: 'layla@email.com', room: 'Outdoor Escape', date: '2024-01-17', time: '4:00 PM', players: 8, source: 'bookeo', status: 'confirmed', whatsappSent: true, emailSent: true },
];

const rooms = ['Butcher', 'Sherlock', 'Lost City', 'VR Rooms', 'Mindshield', 'Outdoor Escape'];

const statusColors = {
  confirmed: { bg: 'rgba(30,136,229,0.15)', color: '#1e88e5' },
  completed: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  cancelled: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
};

const sourceColors = {
  bookeo: { bg: 'rgba(212,168,75,0.15)', color: '#d4a84b' },
  walkin: { bg: 'rgba(156,39,176,0.15)', color: '#ab47bc' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState(dummyBookings);
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.email.toLowerCase().includes(search.toLowerCase());
    const matchRoom = filterRoom === 'all' || b.room === filterRoom;
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchDate = !filterDate || b.date === filterDate;
    return matchSearch && matchRoom && matchStatus && matchDate;
  });

  const updateStatus = (id, status) => {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b));
    setSelectedBooking(null);
  };

  const toggleNotification = (id, type) => {
    setBookings(bookings.map((b) =>
      b.id === id ? { ...b, [type]: !b[type] } : b
    ));
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Room', 'Date', 'Time', 'Players', 'Source', 'Status'];
    const rows = filtered.map((b) => [
      b.name, b.phone, b.email, b.room,
      b.date, b.time, b.players, b.source, b.status
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
  };

  const todayBookings = bookings.filter((b) => b.date === '2024-01-15').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bookings</h1>
          <p className={styles.pageSub}>{filtered.length} records found</p>
        </div>
        <button className={styles.exportBtn} onClick={exportCSV}>
          <i className="bi bi-download"></i> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <i className="bi bi-calendar-day-fill" style={{ color: '#d4a84b' }}></i>
          <div>
            <span className={styles.statNum}>{todayBookings}</span>
            <span className={styles.statLabel}>Today</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="bi bi-check-circle-fill" style={{ color: '#1e88e5' }}></i>
          <div>
            <span className={styles.statNum}>{confirmedBookings}</span>
            <span className={styles.statLabel}>Confirmed</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="bi bi-x-circle-fill" style={{ color: '#f44336' }}></i>
          <div>
            <span className={styles.statNum}>{cancelledBookings}</span>
            <span className={styles.statLabel}>Cancelled</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="bi bi-collection-fill" style={{ color: '#4caf50' }}></i>
          <div>
            <span className={styles.statNum}>{bookings.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        <div className={styles.filters}>
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className={styles.select}>
            <option value="all">All Rooms</option>
            {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.select}>
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.select}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Room</th>
              <th>Date & Time</th>
              <th>Players</th>
              <th>Source</th>
              <th>Status</th>
              <th>Notifications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.noResults}>No bookings found</td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.customerCell}>
                      <div className={styles.avatar}>{b.name.charAt(0)}</div>
                      <div>
                        <div className={styles.name}>{b.name}</div>
                        <div className={styles.muted}>{b.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.roomTag}>{b.room}</span></td>
                  <td>
                    <div className={styles.dateCell}>
                      <span>{b.date}</span>
                      <span className={styles.muted}>{b.time}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.players}>
                      <i className="bi bi-people-fill"></i> {b.players}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.sourceBadge}
                      style={{
                        background: sourceColors[b.source].bg,
                        color: sourceColors[b.source].color,
                      }}
                    >
                      {b.source === 'bookeo' ? '📅 Bookeo' : '🚶 Walk-in'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: statusColors[b.status].bg,
                        color: statusColors[b.status].color,
                      }}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.notifications}>
                      <button
                        className={`${styles.notifBtn} ${b.whatsappSent ? styles.notifSent : ''}`}
                        onClick={() => toggleNotification(b.id, 'whatsappSent')}
                        title="WhatsApp"
                      >
                        <i className="bi bi-whatsapp"></i>
                      </button>
                      <button
                        className={`${styles.notifBtn} ${b.emailSent ? styles.notifSent : ''}`}
                        onClick={() => toggleNotification(b.id, 'emailSent')}
                        title="Email"
                      >
                        <i className="bi bi-envelope-fill"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setSelectedBooking(b)}
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Booking Details</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedBooking(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Name</span>
                  <span>{selectedBooking.name}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Phone</span>
                  <span>{selectedBooking.phone}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Email</span>
                  <span>{selectedBooking.email}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Room</span>
                  <span>{selectedBooking.room}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Date</span>
                  <span>{selectedBooking.date}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Time</span>
                  <span>{selectedBooking.time}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Players</span>
                  <span>{selectedBooking.players}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Source</span>
                  <span>{selectedBooking.source}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Update Status</span>
                <div className={styles.statusBtns}>
                  {['confirmed', 'completed', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      className={`${styles.statusUpdateBtn} ${selectedBooking.status === s ? styles.statusUpdateActive : ''}`}
                      style={selectedBooking.status === s ? {
                        background: statusColors[s].bg,
                        color: statusColors[s].color,
                        borderColor: statusColors[s].color,
                      } : {}}
                      onClick={() => updateStatus(selectedBooking.id, s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}