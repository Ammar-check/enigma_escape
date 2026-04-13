'use client';

import { useState } from 'react';
import styles from './page.module.css'
import WaiverForm from '@/components/admin/WaiverForm';

const dummyWaivers = [
  { id: 1, name: 'Ahmed Al-Rashid', phone: '+966501234567', email: 'ahmed@email.com', room: 'Butcher', date: '2024-01-15', time: '2:00 PM', signed: true, videoConsent: true, language: 'ar' },
  { id: 2, name: 'Sara Mohammed', phone: '+966507654321', email: 'sara@email.com', room: 'Sherlock', date: '2024-01-15', time: '3:30 PM', signed: true, videoConsent: false, language: 'ar' },
  { id: 3, name: 'Khalid Ibrahim', phone: '+966512345678', email: 'khalid@email.com', room: 'Lost City', date: '2024-01-14', time: '11:00 AM', signed: true, videoConsent: true, language: 'en' },
];

export default function WaiversPage() {
  const [showForm, setShowForm] = useState(false);
  const [waivers, setWaivers] = useState(dummyWaivers);
  const [search, setSearch] = useState('');

  const filtered = waivers.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.phone.includes(search)
  );

  // const handleNewWaiver = (data) => {
  //   setWaivers([{ id: Date.now(), ...data, signed: true }, ...waivers]);
  //   setShowForm(false);
  // };

  const handleNewWaiver = (data) => {
  setWaivers(prev => {
    const updated = [
      { id: Date.now(), ...data, signed: true },
      ...prev
    ];
    console.log("UPDATED WAIVERS:", updated);
    return updated;
  });

  setShowForm(false);
  setSearch('');
};

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Waivers</h1>
          <p className={styles.pageSub}>{waivers.length} total waivers</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(true)}>
          <i className="bi bi-plus-lg"></i> New Waiver
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchBox}>
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Room</th>
              <th>Date & Time</th>
              <th>Language</th>
              <th>Video Consent</th>
              <th>Signed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className={styles.tableRow}>
                <td>
                  <div className={styles.nameCell}>
                    <div className={styles.avatar}>{w.name.charAt(0)}</div>
                    <div>
                      <div className={styles.name}>{w.name}</div>
                      <div className={styles.muted}>{w.email}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.muted}>{w.phone}</td>
                <td><span className={styles.roomTag}>{w.room}</span></td>
                <td className={styles.muted}>{w.date} · {w.time}</td>
                <td>{w.language === 'ar' ? '🇸🇦 AR' : '🇺🇸 EN'}</td>
                <td>
                  <span className={w.videoConsent ? styles.yes : styles.no}>
                    {w.videoConsent ? '✓ Yes' : '✗ No'}
                  </span>
                </td>
                <td>
                  <span className={styles.signed}>
                    <i className="bi bi-pen-fill"></i> Signed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Waiver Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>New Waiver Form</h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <WaiverForm onSubmit={handleNewWaiver} />
          </div>
        </div>
      )}
    </div>
  );
}