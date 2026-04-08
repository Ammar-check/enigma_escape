'use client';

import { useState } from 'react';
import styles from './page.module.css';

const dummyCustomers = [
  { id: 1, name: 'Ahmed Al-Rashid', phone: '+966501234567', email: 'ahmed@email.com', language: 'ar', rooms: ['Butcher', 'Sherlock'], totalRooms: 2, isChampion: false, videoRequested: true, videoSent: false, lastVisit: '2024-01-15', status: 'win' },
  { id: 2, name: 'Sara Mohammed', phone: '+966507654321', email: 'sara@email.com', language: 'ar', rooms: ['Lost City'], totalRooms: 1, isChampion: false, videoRequested: false, videoSent: false, lastVisit: '2024-01-15', status: 'lose' },
  { id: 3, name: 'Khalid Ibrahim', phone: '+966512345678', email: 'khalid@email.com', language: 'en', rooms: ['Butcher', 'Sherlock', 'Lost City', 'VR', 'Mindshield'], totalRooms: 5, isChampion: true, videoRequested: true, videoSent: true, lastVisit: '2024-01-14', status: 'champion' },
  { id: 4, name: 'Fatima Hassan', phone: '+966598765432', email: 'fatima@email.com', language: 'ar', rooms: ['VR'], totalRooms: 1, isChampion: false, videoRequested: true, videoSent: false, lastVisit: '2024-01-14', status: 'win' },
  { id: 5, name: 'Omar Abdullah', phone: '+966511223344', email: 'omar@email.com', language: 'en', rooms: ['Mindshield', 'Butcher'], totalRooms: 2, isChampion: false, videoRequested: false, videoSent: false, lastVisit: '2024-01-13', status: 'lose' },
  { id: 6, name: 'Layla Al-Saud', phone: '+966522334455', email: 'layla@email.com', language: 'ar', rooms: ['Sherlock'], totalRooms: 1, isChampion: false, videoRequested: true, videoSent: true, lastVisit: '2024-01-12', status: 'win' },
];

const statusColors = {
  win: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  lose: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
  champion: { bg: 'rgba(212,168,75,0.15)', color: '#d4a84b' },
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterVideo, setFilterVideo] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState(dummyCustomers);

  // Filter logic
  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchRoom = filterRoom === 'all' || c.rooms.includes(filterRoom);
    const matchLanguage = filterLanguage === 'all' || c.language === filterLanguage;
    const matchVideo =
      filterVideo === 'all' ||
      (filterVideo === 'pending' && c.videoRequested && !c.videoSent) ||
      (filterVideo === 'sent' && c.videoSent) ||
      (filterVideo === 'none' && !c.videoRequested);
    return matchSearch && matchRoom && matchLanguage && matchVideo;
  });

  // Export CSV
  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Language', 'Rooms Played', 'Champion', 'Video', 'Last Visit'];
    const rows = filtered.map((c) => [
      c.name, c.phone, c.email,
      c.language === 'ar' ? 'Arabic' : 'English',
      c.totalRooms,
      c.isChampion ? 'Yes' : 'No',
      c.videoSent ? 'Sent' : c.videoRequested ? 'Pending' : 'No',
      c.lastVisit,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
  };

  // Delete
  const deleteCustomer = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSub}>{filtered.length} records found</p>
        </div>
        <button className={styles.exportBtn} onClick={exportCSV}>
          <i className="bi bi-download"></i> Export CSV
        </button>
      </div>

      {/* Search + Filters */}
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
            <button className={styles.clearSearch} onClick={() => setSearch('')}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className={styles.select}>
            <option value="all">All Rooms</option>
            <option value="Butcher">The Butcher</option>
            <option value="Sherlock">Sherlock</option>
            <option value="Lost City">Lost City</option>
            <option value="VR">VR Rooms</option>
            <option value="Mindshield">Mindshield</option>
          </select>

          <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} className={styles.select}>
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>

          <select value={filterVideo} onChange={(e) => setFilterVideo(e.target.value)} className={styles.select}>
            <option value="all">All Videos</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="none">No Request</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Language</th>
              {/* <th>Rooms</th> */}
              <th>Status</th>
              <th>Video</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.noResults}>No customers found</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.customerCell}>
                      <div className={styles.avatar}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.customerName}>
                          {c.isChampion && <i className="bi bi-trophy-fill" style={{ color: '#d4a84b', marginRight: 5 }}></i>}
                          {c.name}
                        </div>
                        <div className={styles.customerSub}>{c.totalRooms} rooms played</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{c.phone}</span>
                      <span className={styles.muted}>{c.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.langBadge}>
                      {c.language === 'ar' ? '🇸🇦 AR' : '🇺🇸 EN'}
                    </span>
                  </td>
                  {/* <td>
                    <div className={styles.roomTags}>
                      {c.rooms.map((r) => (
                        <span key={r} className={styles.roomTag}>{r}</span>
                      ))}
                    </div>
                  </td> */}
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: statusColors[c.status].bg,
                        color: statusColors[c.status].color,
                      }}
                    >
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {c.videoRequested ? (
                      <span className={`${styles.videoBadge} ${c.videoSent ? styles.videoSent : styles.videoPending}`}>
                        {c.videoSent ? '✓ Sent' : '⏳ Pending'}
                      </span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td className={styles.muted}>{c.lastVisit}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => setSelectedCustomer(c)}
                        title="View"
                      >
                        <i className="bi bi-eye-fill"></i>
                      </button>
                      <button className={styles.actionBtn} title="Edit">
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => deleteCustomer(c.id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCustomer(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {selectedCustomer.isChampion && <i className="bi bi-trophy-fill" style={{ color: '#d4a84b', marginRight: 8 }}></i>}
                {selectedCustomer.name}
              </h3>
              <button className={styles.modalClose} onClick={() => setSelectedCustomer(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Phone</span>
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Email</span>
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Language</span>
                  <span>{selectedCustomer.language === 'ar' ? 'Arabic' : 'English'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Total Rooms</span>
                  <span>{selectedCustomer.totalRooms} / 5</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Last Visit</span>
                  <span>{selectedCustomer.lastVisit}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Video</span>
                  <span>{selectedCustomer.videoSent ? 'Sent' : selectedCustomer.videoRequested ? 'Pending' : 'Not Requested'}</span>
                </div>
              </div>

              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Rooms Played</span>
                <div className={styles.roomTags} style={{ marginTop: 8 }}>
                  {selectedCustomer.rooms.map((r) => (
                    <span key={r} className={styles.roomTag}>{r}</span>
                  ))}
                </div>
              </div>

              {selectedCustomer.isChampion && (
                <div className={styles.championBanner}>
                  <i className="bi bi-trophy-fill"></i>
                  CHAMPION — All rooms completed!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}