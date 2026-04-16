'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css'
import WaiverForm from '@/components/admin/WaiverForm';

export default function WaiversPage() {
  const [showForm, setShowForm] = useState(false);
  const [waivers, setWaivers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaivers = async () => {
      setLoading(true);

      // Load Supabase client dynamically so it only runs in the browser
      const { supabase } = await import("@/lib/supabase");

      const { data, error } = await supabase
        .from('waiver_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWaivers(
          data.map((w) => {
            const participants = Array.isArray(w.participants)
              ? w.participants
              : [];
            const primary = participants[0] || {};

            return {
              id: w.id,
              participants,
              name: primary.name || '',
              phone: primary.phone || '',
              email: primary.email || '',
              room: w.room || '',
              date: w.created_at ? w.created_at.split('T')[0] : '',
              time: w.created_at
                ? new Date(w.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '',
              language: w.language || 'en',
              videoConsent:
                typeof w.video_consent === 'boolean'
                  ? w.video_consent
                  : w.video_consent === 'Yes — I consent',
            };
          })
        );
      }
      setLoading(false);
    };

    fetchWaivers();
  }, []);

  const filtered = waivers.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.phone.includes(search)
  );

  // const handleNewWaiver = (data) => {
  //   setWaivers([{ id: Date.now(), ...data, signed: true }, ...waivers]);
  //   setShowForm(false);
  // };

  const handleNewWaiver = (data) => {
    setWaivers(prev => [
      { id: Date.now(), ...data, signed: true },
      ...prev
    ]);
    setShowForm(false);
    setSearch('');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Waivers</h1>
          <p className={styles.pageSub}>
            {loading ? 'Loading waivers…' : `${waivers.length} total waivers`}
          </p>
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
              <th>Participants</th>
              <th>Phone</th>
              <th>Room</th>
              <th>Date & Time</th>
              <th>Language</th>
              <th>Video Consent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className={styles.tableRow}>
                <td>
                  <div className={styles.participantsCell}>
                    {Array.isArray(w.participants) && w.participants.length > 0 ? (
                      w.participants.map((p, idx) => (
                        <div key={idx} className={styles.participantItem}>
                          <div className={styles.participantLabel}>
                            {`Participant ${idx + 1}`}
                          </div>
                          <div className={styles.participantDetails}>
                            <div className={styles.participantName}>
                              <strong>{p.name || 'Unnamed'}</strong>
                            </div>
                            {p.email && (
                              <div className={styles.participantMeta}>
                                {p.email}
                              </div>
                            )}
                            {p.phone && (
                              <div className={styles.participantMeta}>
                                {p.phone}
                              </div>
                            )}
                            {p.birthday && (
                              <div className={styles.participantMeta}>
                                {p.birthday}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.participantItem}>
                        <div className={styles.participantLabel}>Participant 1</div>
                        <div className={styles.participantDetails}>
                          <div className={styles.participantName}>
                            <strong>{w.name || 'Unnamed'}</strong>
                          </div>
                          {w.email && (
                            <div className={styles.participantMeta}>{w.email}</div>
                          )}
                          {w.phone && (
                            <div className={styles.participantMeta}>{w.phone}</div>
                          )}
                        </div>
                      </div>
                    )}
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