'use client';

import { useState } from 'react';
import styles from './videos.module.css';

const dummyVideos = [
  { id: 1, name: 'Ahmed Al-Rashid', phone: '+966501234567', email: 'ahmed@email.com', room: 'Butcher', date: '2024-01-15', time: '2:00 PM', videoSent: false, sentAt: null },
  { id: 2, name: 'Fatima Hassan', phone: '+966598765432', email: 'fatima@email.com', room: 'VR Rooms', date: '2024-01-15', time: '5:00 PM', videoSent: false, sentAt: null },
  { id: 3, name: 'Khalid Ibrahim', phone: '+966512345678', email: 'khalid@email.com', room: 'Lost City', date: '2024-01-14', time: '11:00 AM', videoSent: true, sentAt: '2024-01-14 3:00 PM' },
  { id: 4, name: 'Omar Abdullah', phone: '+966511223344', email: 'omar@email.com', room: 'Sherlock', date: '2024-01-14', time: '4:00 PM', videoSent: false, sentAt: null },
  { id: 5, name: 'Layla Al-Saud', phone: '+966522334455', email: 'layla@email.com', room: 'Mindshield', date: '2024-01-13', time: '6:00 PM', videoSent: true, sentAt: '2024-01-13 8:00 PM' },
];

export default function VideosPage() {
  const [videos, setVideos] = useState(dummyVideos);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  const filtered = videos.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !v.videoSent) ||
      (filterStatus === 'sent' && v.videoSent);
    const matchRoom = filterRoom === 'all' || v.room === filterRoom;
    const matchDate = !filterDate || v.date === filterDate;
    return matchSearch && matchStatus && matchRoom && matchDate;
  });

  const markAsSent = (id) => {
    const now = new Date().toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    setVideos(videos.map((v) =>
      v.id === id ? { ...v, videoSent: true, sentAt: now } : v
    ));
  };

  const markAsPending = (id) => {
    setVideos(videos.map((v) =>
      v.id === id ? { ...v, videoSent: false, sentAt: null } : v
    ));
  };

  const pendingCount = videos.filter((v) => !v.videoSent).length;
  const sentCount = videos.filter((v) => v.videoSent).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Video Queue</h1>
          <p className={styles.pageSub}>Manage and track video delivery</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <i className="bi bi-hourglass-split" style={{ color: '#ff9800' }}></i>
          <div>
            <span className={styles.statNum}>{pendingCount}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="bi bi-check-circle-fill" style={{ color: '#4caf50' }}></i>
          <div>
            <span className={styles.statNum}>{sentCount}</span>
            <span className={styles.statLabel}>Sent</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="bi bi-camera-video-fill" style={{ color: '#d4a84b' }}></i>
          <div>
            <span className={styles.statNum}>{videos.length}</span>
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
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          {/* Status tabs */}
          <div className={styles.tabGroup}>
            {['all', 'pending', 'sent'].map((s) => (
              <button
                key={s}
                className={`${styles.tab} ${filterStatus === s ? styles.tabActive : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Rooms</option>
            {['Butcher', 'Sherlock', 'Lost City', 'VR Rooms', 'Mindshield', 'Outdoor Escape'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.select}
          />
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <i className="bi bi-camera-video-off"></i>
          <p>No videos found</p>
        </div>
      ) : (
        <div className={styles.videoGrid}>
          {filtered.map((v) => (
            <div
              key={v.id}
              className={`${styles.videoCard} ${v.videoSent ? styles.sentCard : styles.pendingCard}`}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{v.name.charAt(0)}</div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{v.name}</span>
                  <span className={styles.cardPhone}>{v.phone}</span>
                </div>
                <span className={`${styles.statusDot} ${v.videoSent ? styles.dotSent : styles.dotPending}`}></span>
              </div>

              {/* Card Details */}
              <div className={styles.cardDetails}>
                <div className={styles.detailItem}>
                  <i className="bi bi-controller"></i>
                  <span>{v.room}</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="bi bi-calendar3"></i>
                  <span>{v.date}</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="bi bi-clock"></i>
                  <span>{v.time}</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="bi bi-envelope"></i>
                  <span className={styles.email}>{v.email}</span>
                </div>
              </div>

              {/* Sent info */}
              {v.videoSent && v.sentAt && (
                <div className={styles.sentInfo}>
                  <i className="bi bi-check-circle-fill"></i>
                  Sent at {v.sentAt}
                </div>
              )}

              {/* Action Button */}
              <div className={styles.cardAction}>
                {!v.videoSent ? (
                  <button
                    className={styles.sendBtn}
                    onClick={() => markAsSent(v.id)}
                  >
                    <i className="bi bi-send-fill"></i>
                    Mark as Sent
                  </button>
                ) : (
                  <button
                    className={styles.undoBtn}
                    onClick={() => markAsPending(v.id)}
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                    Mark as Pending
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}