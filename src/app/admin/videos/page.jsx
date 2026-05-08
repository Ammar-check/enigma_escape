'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './videos.module.css';
import { supabase } from '@/lib/supabase';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => videos.filter((v) => {
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
  }), [videos, search, filterStatus, filterRoom, filterDate]);

  const roomOptions = useMemo(
    () => Array.from(new Set(videos.map((video) => video.room).filter(Boolean))),
    [videos]
  );

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, first_name, last_name, primary_phone, phone_mobile, email, rooms, last_visit, video_requested, video_sent, updated_at')
        .or('video_requested.eq.true,video_sent.eq.true')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Videos load error:', error);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((customer) => {
        const rooms = Array.isArray(customer.rooms) ? customer.rooms : [];
        const name = customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown';
        const dateSource = customer.last_visit || customer.updated_at;
        const dt = dateSource ? new Date(dateSource) : null;
        return {
          id: customer.id,
          name,
          phone: customer.primary_phone || customer.phone_mobile || '—',
          email: customer.email || '—',
          room: rooms.join(', ') || '—',
          date: dt ? dt.toISOString().slice(0, 10) : '',
          time: dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          videoSent: Boolean(customer.video_sent),
          sentAt: customer.video_sent && customer.updated_at ? new Date(customer.updated_at).toLocaleString() : null,
        };
      });
      setVideos(mapped);
      setLoading(false);
    };

    loadVideos();
  }, []);

  const markAsSent = (id) => {
    const updateVideo = async () => {
      const { error } = await supabase.from('customers').update({ video_requested: true, video_sent: true }).eq('id', id);
      if (error) {
        console.error('Mark as sent failed:', error);
        return;
      }
      const now = new Date().toLocaleString();
      setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, videoSent: true, sentAt: now } : v)));
    };
    updateVideo();
  };

  const markAsPending = (id) => {
    const updateVideo = async () => {
      const { error } = await supabase.from('customers').update({ video_requested: true, video_sent: false }).eq('id', id);
      if (error) {
        console.error('Mark as pending failed:', error);
        return;
      }
      setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, videoSent: false, sentAt: null } : v)));
    };
    updateVideo();
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
            {roomOptions.map((r) => (
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
      {loading ? (
        <div className={styles.empty}>
          <i className="bi bi-hourglass-split"></i>
          <p>Loading video queue...</p>
        </div>
      ) : filtered.length === 0 ? (
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