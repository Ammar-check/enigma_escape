'use client';

import { useState } from 'react';
import styles from './result.module.css';

const rooms = ['Butcher', 'Sherlock', 'Lost City', 'VR Rooms', 'Mindshield', 'Outdoor Escape'];

const dummyResults = [
  { id: 1, name: 'Ahmed Al-Rashid', phone: '+966501234567', room: 'Butcher', date: '2024-01-15', time: '2:00 PM', status: 'win', videoPurchased: true, videoSent: false, notes: 'Great team', isChampion: false },
  { id: 2, name: 'Sara Mohammed', phone: '+966507654321', room: 'Sherlock', date: '2024-01-15', time: '3:30 PM', status: 'lose', videoPurchased: false, videoSent: false, notes: '', isChampion: false },
  { id: 3, name: 'Khalid Ibrahim', phone: '+966512345678', room: 'Mindshield', date: '2024-01-14', time: '11:00 AM', status: 'champion', videoPurchased: true, videoSent: true, notes: 'Completed all rooms!', isChampion: true },
  { id: 4, name: 'Fatima Hassan', phone: '+966598765432', room: 'VR Rooms', date: '2024-01-14', time: '5:00 PM', status: 'win', videoPurchased: true, videoSent: false, notes: '', isChampion: false },
];

const statusColors = {
  win: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  lose: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
  champion: { bg: 'rgba(212,168,75,0.15)', color: '#d4a84b' },
};

export default function GameResultsPage() {
  const [results, setResults] = useState(dummyResults);
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = results.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    const matchRoom = filterRoom === 'all' || r.room === filterRoom;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchRoom && matchStatus;
  });

  const startEdit = (result) => {
    setEditingId(result.id);
    setEditForm({ ...result });
  };

  const saveEdit = () => {
    setResults(results.map((r) => (r.id === editingId ? { ...editForm } : r)));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const updateField = (field, value) => setEditForm({ ...editForm, [field]: value });

  const toggleVideoSent = (id) => {
    setResults(results.map((r) =>
      r.id === id ? { ...r, videoSent: !r.videoSent } : r
    ));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Game Results</h1>
          <p className={styles.pageSub}>{filtered.length} records</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statPill}>
            <i className="bi bi-trophy-fill" style={{ color: '#d4a84b' }}></i>
            {results.filter((r) => r.isChampion).length} Champions
          </div>
          <div className={styles.statPill}>
            <i className="bi bi-camera-video-fill" style={{ color: '#00bfff' }}></i>
            {results.filter((r) => r.videoPurchased && !r.videoSent).length} Videos Pending
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
          <select  value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className={styles.select} >
            <option value="all">All Rooms</option>
            {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.select}>
            <option value="all">All Status</option>
            <option value="win">Win</option>
            <option value="lose">Lose</option>
            <option value="champion">Champion</option>
          </select>
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
              <th>Status</th>
              <th>Video</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              editingId === r.id ? (
                // Edit Row
                <tr key={r.id} className={styles.editRow}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{r.name.charAt(0)}</div>
                      <div>
                        <div className={styles.name}>{r.name}</div>
                        <div className={styles.muted}>{r.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={editForm.room}
                      onChange={(e) => updateField('room', e.target.value)}
                      className={styles.editSelect}
                    >
                      {rooms.map((room) => <option style={{background:'black'}} key={room} value={room}>{room}</option>)}
                    </select>
                  </td>
                  <td className={styles.muted}>{r.date} · {r.time}</td>
                  <td>
                    <select
                      value={editForm.status}
                      onChange={(e) => updateField('status', e.target.value)}
                      className={styles.editSelect}
                    >
                      <option style={{background:'black'}} value="win">Win</option>
                      <option style={{background:'black'}} value="lose">Lose</option>
                      <option style={{background:'black'}} value="champion">Champion</option>
                    </select>
                  </td>
                  <td>
                    <div className={styles.videoEditGroup}>
                      <label className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={editForm.videoPurchased}
                          onChange={(e) => updateField('videoPurchased', e.target.checked)}
                        />
                        Purchased
                      </label>
                      <label className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={editForm.videoSent}
                          onChange={(e) => updateField('videoSent', e.target.checked)}
                        />
                        Sent
                      </label>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editForm.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      className={styles.editInput}
                      placeholder="Add notes..."
                    />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.saveBtn} onClick={saveEdit}>
                        <i className="bi bi-check-lg"></i>
                      </button>
                      <button className={styles.cancelBtn} onClick={cancelEdit}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // View Row
                <tr key={r.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{r.name.charAt(0)}</div>
                      <div>
                        <div className={styles.name}>
                          {r.isChampion && <i className="bi bi-trophy-fill" style={{ color: '#d4a84b', marginRight: 5 }}></i>}
                          {r.name}
                        </div>
                        <div className={styles.muted}>{r.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.roomTag}>{r.room}</span></td>
                  <td className={styles.muted}>{r.date} · {r.time}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: statusColors[r.status].bg,
                        color: statusColors[r.status].color,
                      }}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {r.videoPurchased ? (
                      <button
                        className={`${styles.videoBtn} ${r.videoSent ? styles.videoSentBtn : styles.videoPendingBtn}`}
                        onClick={() => toggleVideoSent(r.id)}
                        title={r.videoSent ? 'Mark as pending' : 'Mark as sent'}
                      >
                        {r.videoSent ? (
                          <><i className="bi bi-check-lg"></i> Sent</>
                        ) : (
                          <><i className="bi bi-send-fill"></i> Pending</>
                        )}
                      </button>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td className={styles.notesCell}>
                    {r.notes || <span className={styles.muted}>—</span>}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => startEdit(r)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}