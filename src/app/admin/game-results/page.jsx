'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './result.module.css';
const PAGE_SIZE = 30;

const statusColors = {
  win: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  lose: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
  champion: { bg: 'rgba(212,168,75,0.15)', color: '#d4a84b' },
};

export default function GameResultsPage() {
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('winners');
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [stats, setStats] = useState({
    champions: 0,
    videosPending: 0,
  });

  const roomOptions = useMemo(
    () => Array.from(new Set(results.map((row) => row.room).filter(Boolean))),
    [results]
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const mapCustomerToResult = (customer) => {
    const first = customer.first_name || '';
    const last = customer.last_name || '';
    const full = customer.full_name || `${first} ${last}`.trim();
    const statusRaw = String(customer.status || '').trim().toLowerCase();
    const isChampion = Boolean(customer.is_champion) || statusRaw === 'champion';
    const status = isChampion ? 'champion' : statusRaw === 'lose' || statusRaw === 'loss' ? 'lose' : 'win';
    const lastVisit = customer.last_visit ? new Date(customer.last_visit) : null;

    return {
      id: customer.id,
      name: full || 'Unknown',
      phone: customer.phone_mobile || customer.primary_phone || customer.phone || '—',
      room: customer.rooms || '—',
      date: lastVisit ? lastVisit.toLocaleDateString() : '—',
      time: lastVisit ? lastVisit.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      dateRaw: customer.last_visit || null,
      status,
      videoPurchased: Boolean(customer.video_requested),
      videoSent: Boolean(customer.video_sent),
      notes: customer.alert_message || '',
      isChampion,
      raw: customer,
    };
  };

  const fetchStats = async () => {
    const { supabase } = await import('@/lib/supabase');
    const [championsRes, pendingRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('is_champion', true),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('video_requested', true).eq('video_sent', false),
    ]);
    setStats({
      champions: championsRes.count || 0,
      videosPending: pendingRes.count || 0,
    });
  };

  const fetchResults = async (
    page = currentPage,
    searchTerm = search,
    room = filterRoom,
    status = filterStatus,
    date = filterDate
  ) => {
    setLoading(true);
    setMessage('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const normalizedSearch = String(searchTerm || '').trim().replace(/,/g, ' ');
      const like = `%${normalizedSearch}%`;

      let query = supabase
        .from('customers')
        .select(
          'id,full_name,first_name,last_name,primary_phone,phone_mobile,phone,rooms,last_visit,status,is_champion,video_requested,video_sent,alert_message',
          { count: 'exact' }
        )
        .order('last_visit', { ascending: false, nullsFirst: false });

      if (normalizedSearch) {
        query = query.or(
          `full_name.ilike.${like},first_name.ilike.${like},last_name.ilike.${like},primary_phone.ilike.${like},phone_mobile.ilike.${like},phone.ilike.${like}`
        );
      }

      if (room !== 'all') {
        query = query.eq('rooms', room);
      }

      const effectiveStatus = status === 'all' ? (activeTab === 'losers' ? 'lose' : 'win') : status;

      if (effectiveStatus !== 'all') {
        if (effectiveStatus === 'champion') {
          query = query.eq('is_champion', true);
        } else if (effectiveStatus === 'win') {
          query = query.or('status.eq.win,status.eq.booked,status.eq.completed,status.eq.checked_in').eq('is_champion', false);
        } else if (effectiveStatus === 'lose') {
          query = query.or('status.eq.lose,status.eq.loss,status.eq.no_show,status.eq.canceled,status.eq.cancelled');
        }
      }

      if (date) {
        query = query.gte('last_visit', `${date}T00:00:00`).lt('last_visit', `${date}T23:59:59`);
      }

      const { data, error, count } = await query.range(from, to);
      if (error) {
        setMessage(`Load failed: ${error.message}`);
        setResults([]);
        setTotalCount(0);
        return;
      }

      setResults((data || []).map(mapCustomerToResult));
      setTotalCount(count || 0);
      await fetchStats();
    } catch (error) {
      console.error('Game results load error:', error);
      setMessage('Unable to load game results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(currentPage, search, filterRoom, filterStatus, filterDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const filtered = results;

  const winnersCount = filtered.filter((row) => row.status === 'win' || row.status === 'champion').length;
  const losersCount = filtered.filter((row) => row.status === 'lose').length;

  const startEdit = (result) => {
    setEditingId(result.id);
    setEditForm({ ...result });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { supabase } = await import('@/lib/supabase');
    const payload = {
      rooms: editForm.room || null,
      status: editForm.status === 'champion' ? 'champion' : editForm.status || 'win',
      is_champion: editForm.status === 'champion',
      video_requested: Boolean(editForm.videoPurchased),
      video_sent: Boolean(editForm.videoSent),
      alert_message: editForm.notes || null,
    };

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', editingId)
      .select('id,full_name,first_name,last_name,primary_phone,phone_mobile,phone,rooms,last_visit,status,is_champion,video_requested,video_sent,alert_message')
      .single();

    if (error) {
      setMessage(`Save failed: ${error.message}`);
      return;
    }

    const updated = mapCustomerToResult(data);
    setResults((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
    fetchStats();
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const updateField = (field, value) => setEditForm({ ...editForm, [field]: value });

  const toggleVideoSent = async (id) => {
    const row = results.find((result) => result.id === id);
    if (!row) return;
    const nextVideoSent = !row.videoSent;
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase
      .from('customers')
      .update({ video_requested: true, video_sent: nextVideoSent })
      .eq('id', id);
    if (error) {
      setMessage(`Video status update failed: ${error.message}`);
      return;
    }
    setResults((prev) =>
      prev.map((result) =>
        result.id === id
          ? { ...result, videoPurchased: true, videoSent: nextVideoSent }
          : result
      )
    );
    fetchStats();
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Game Results</h1>
          <p className={styles.pageSub}>{loading ? 'Loading...' : `${totalCount} records`}</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statPill}>
            <i className="bi bi-trophy-fill" style={{ color: '#d4a84b' }}></i>
            {stats.champions} Champions
          </div>
          <div className={styles.statPill}>
            <i className="bi bi-camera-video-fill" style={{ color: '#00bfff' }}></i>
            {stats.videosPending} Videos Pending
          </div>
        </div>
      </div>
      {message && <p className={styles.pageSub}>{message}</p>}

      {/* Controls */}
      <div className={styles.tabsRow}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'winners' ? styles.tabBtnActive : ''}`}
          onClick={() => {
            setActiveTab('winners');
            if (currentPage !== 1) setCurrentPage(1);
          }}
        >
          Winners ({activeTab === 'winners' ? totalCount : winnersCount})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'losers' ? styles.tabBtnActive : ''}`}
          onClick={() => {
            setActiveTab('losers');
            if (currentPage !== 1) setCurrentPage(1);
          }}
        >
          Losers ({activeTab === 'losers' ? totalCount : losersCount})
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={async (e) => {
              const next = e.target.value;
              setSearch(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchResults(1, next, filterRoom, filterStatus, filterDate);
            }}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={filterRoom}
            onChange={async (e) => {
              const next = e.target.value;
              setFilterRoom(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchResults(1, search, next, filterStatus, filterDate);
            }}
            className={styles.select}
          >
            <option value="all">All Rooms</option>
            {roomOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={async (e) => {
              const next = e.target.value;
              setFilterStatus(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchResults(1, search, filterRoom, next, filterDate);
            }}
            className={styles.select}
          >
            <option value="all">All Status</option>
            <option value="win" disabled={activeTab === 'losers'}>Win</option>
            <option value="lose" disabled={activeTab === 'winners'}>Lose</option>
            <option value="champion">Champion</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={async (e) => {
              const next = e.target.value;
              setFilterDate(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchResults(1, search, filterRoom, filterStatus, next);
            }}
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
              <th>Status</th>
              <th>Video</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.noResults}>Loading game results...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className={styles.noResults}>No results found</td></tr>
            ) : filtered.map((r) => (
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
                      {roomOptions.map((room) => <option style={{ background: 'black' }} key={room} value={room}>{room}</option>)}
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

      <div className={styles.pagination}>
        <button className={styles.pageBtn} disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}>Prev</button>
        <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
        <button className={styles.pageBtn} disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}>Next</button>
        <input className={styles.pageJumpInput} type="number" min={1} max={totalPages} value={pageInput} onChange={(e) => setPageInput(e.target.value)} />
        <button className={styles.pageBtn} onClick={() => {
          const target = Number.parseInt(pageInput, 10);
          if (!Number.isInteger(target)) return;
          setCurrentPage(Math.min(totalPages, Math.max(1, target)));
        }}>Go</button>
      </div>
    </div>
  );
}