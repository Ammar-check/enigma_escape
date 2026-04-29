'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

const dummyCustomers = [
  { id: 1, name: 'Ahmed Al-Rashid', phone: '+966501234567', email: 'ahmed@email.com', language: 'ar', rooms: ['Butcher', 'Sherlock'], totalRooms: 2, isChampion: false, videoRequested: true, videoSent: false, lastVisit: '2024-01-15', status: 'win', city: '', country: '', alertMessage: '' },
  { id: 2, name: 'Sara Mohammed', phone: '+966507654321', email: 'sara@email.com', language: 'ar', rooms: ['Lost City'], totalRooms: 1, isChampion: false, videoRequested: false, videoSent: false, lastVisit: '2024-01-15', status: 'lose', city: '', country: '', alertMessage: '' },
  { id: 3, name: 'Khalid Ibrahim', phone: '+966512345678', email: 'khalid@email.com', language: 'en', rooms: ['Butcher', 'Sherlock', 'Lost City', 'VR', 'Mindshield'], totalRooms: 5, isChampion: true, videoRequested: true, videoSent: true, lastVisit: '2024-01-14', status: 'champion', city: '', country: '', alertMessage: '' },
];

const statusColors = {
  win: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  lose: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
  champion: { bg: 'rgba(212,168,75,0.15)', color: '#d4a84b' },
};

const csvToBool = (value) => String(value || '').trim().toLowerCase() === 'true';
const csvToInt = (value) => {
  const n = Number.parseInt(String(value || '0').trim(), 10);
  return Number.isNaN(n) ? 0 : n;
};
const csvToFloat = (value) => {
  const n = Number.parseFloat(String(value || '0').trim());
  return Number.isNaN(n) ? 0 : n;
};
const normalizeDate = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const parts = raw.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return raw;
};

const parseCsvLine = (line, delimiter) => {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === delimiter && !inQuotes) {
      out.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  out.push(current.trim());
  return out;
};

const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = parseCsvLine(lines[0], delimiter);

  return lines.slice(1).map((line) => {
    const row = parseCsvLine(line, delimiter);
    return headers.reduce((acc, header, index) => {
      acc[header] = row[index] ?? '';
      return acc;
    }, {});
  });
};

const mapCsvRowToDbCustomer = (row) => {
  const totalBookings = csvToInt(row['Total bookings']);
  const noShows = csvToInt(row['No-shows']);
  const cancellations = csvToInt(row.Cancellations);
  const createdDate = normalizeDate(row.Created);
  const lastVisit = normalizeDate(row['Last visit']);
  const nextVisit = normalizeDate(row['Next visit']);
  const memberUntil = normalizeDate(row['Member until']);
  const membershipPausedFrom = normalizeDate(row['Membership paused from']);
  const membershipPausedUntil = normalizeDate(row['Membership paused until']);
  const membershipNextPayment = normalizeDate(row['Membership next payment']);
  const fullName = `${(row['First name'] || '').trim()} ${(row['Last name'] || '').trim()}`.trim();
  const isChampion = totalBookings >= 5;

  return {
    first_name: (row['First name'] || '').trim(),
    last_name: (row['Last name'] || '').trim(),
    full_name: fullName,
    email: (row.Email || '').trim(),
    phone_home: (row['Telephone (home)'] || '').trim(),
    phone_work: (row['Telephone (work)'] || '').trim(),
    phone_mobile: (row['Telephone (mobile)'] || '').trim(),
    primary_phone:
      (row['Telephone (mobile)'] || '').trim() ||
      (row['Telephone (home)'] || '').trim() ||
      (row['Telephone (work)'] || '').trim(),
    address_1: (row['Address 1'] || '').trim(),
    address_2: (row['Address 2'] || '').trim(),
    city: (row.City || '').trim(),
    state_province: (row['State/Province'] || '').trim(),
    zip_postcode: (row['Zip/Postcode'] || '').trim(),
    country: (row.Country || '').trim(),
    gender: (row.Gender || '').trim(),
    date_of_birth: normalizeDate(row['Date of birth']),
    external_created_at: createdDate,
    total_bookings: totalBookings,
    cancellations,
    no_shows: noShows,
    mailing_list: csvToBool(row['Mailing list']),
    credit: csvToFloat(row.Credit),
    membership_enrolled: (row['Membership enrolled'] || '').trim(),
    member_until: memberUntil,
    membership_rate: (row['Membership rate'] || '').trim(),
    membership_paused_from: membershipPausedFrom,
    membership_paused_until: membershipPausedUntil,
    membership_next_payment: membershipNextPayment,
    last_visit: lastVisit,
    next_visit: nextVisit,
    alert_message: (row['Alert message'] || '').trim(),
    require_approval: csvToBool(row['Require approval']),
    language: 'ar',
    status: isChampion ? 'champion' : noShows > 0 ? 'lose' : 'win',
    is_champion: isChampion,
    video_requested: false,
    video_sent: false,
    rooms: [],
  };
};

const mapDbCustomerToUi = (customer) => ({
  id: customer.id,
  name: customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown',
  phone: customer.primary_phone || customer.phone_mobile || customer.phone_home || customer.phone_work || '—',
  email: customer.email || '—',
  language: customer.language || 'ar',
  rooms: Array.isArray(customer.rooms) ? customer.rooms : [],
  totalRooms: customer.total_bookings || 0,
  isChampion: Boolean(customer.is_champion),
  videoRequested: Boolean(customer.video_requested),
  videoSent: Boolean(customer.video_sent),
  lastVisit: customer.last_visit || '—',
  status: customer.status || 'win',
  city: customer.city || '',
  country: customer.country || '',
  alertMessage: customer.alert_message || '',
});

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterVideo, setFilterVideo] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading customers:', error);
          setCustomers(dummyCustomers);
          return;
        }

        if (!data || data.length === 0) {
          setCustomers(dummyCustomers);
          return;
        }

        setCustomers(data.map(mapDbCustomerToUi));
      } catch (error) {
        console.error('Unexpected loading error:', error);
        setCustomers(dummyCustomers);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const roomOptions = useMemo(
    () =>
      Array.from(
        new Set(
          customers
            .flatMap((customer) => customer.rooms)
            .filter(Boolean)
            .map((room) => String(room).trim())
        )
      ),
    [customers]
  );

  const filtered = customers.filter((customer) => {
    const matchSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search) ||
      customer.email.toLowerCase().includes(search.toLowerCase());
    const matchRoom = filterRoom === 'all' || customer.rooms.includes(filterRoom);
    const matchLanguage = filterLanguage === 'all' || customer.language === filterLanguage;
    const matchVideo =
      filterVideo === 'all' ||
      (filterVideo === 'pending' && customer.videoRequested && !customer.videoSent) ||
      (filterVideo === 'sent' && customer.videoSent) ||
      (filterVideo === 'none' && !customer.videoRequested);
    return matchSearch && matchRoom && matchLanguage && matchVideo;
  });

  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportMessage('');
    setIsImporting(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const text = await file.text();
      const rows = parseCsvText(text);
      if (rows.length === 0) {
        setImportMessage('No data rows found in CSV.');
        return;
      }

      const payload = rows.map(mapCsvRowToDbCustomer);
      const { data, error } = await supabase.from('customers').insert(payload).select('*');
      if (error) {
        console.error('Import error:', error);
        setImportMessage(`Import failed: ${error.message}`);
        return;
      }

      const inserted = (data || []).map(mapDbCustomerToUi);
      setCustomers((prev) => [...inserted, ...prev]);
      setImportMessage(`${inserted.length} customers imported successfully.`);
    } catch (error) {
      console.error('CSV import failure:', error);
      setImportMessage('Import failed due to unexpected error.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Language', 'Total bookings', 'Champion', 'Video', 'Last Visit'];
    const rows = filtered.map((customer) => [
      customer.name,
      customer.phone,
      customer.email,
      customer.language === 'ar' ? 'Arabic' : 'English',
      customer.totalRooms,
      customer.isChampion ? 'Yes' : 'No',
      customer.videoSent ? 'Sent' : customer.videoRequested ? 'Pending' : 'No',
      customer.lastVisit,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    link.click();
  };

  const deleteCustomer = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter((customer) => customer.id !== id));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSub}>{loading ? 'Loading customers...' : `${filtered.length} records found`}</p>
        </div>
        <button className={styles.exportBtn} onClick={exportCSV}>
          <i className="bi bi-download"></i> Export CSV
        </button>
      </div>

      <div className={styles.importPanel}>
        <div>
          <h3 className={styles.importTitle}>Import Customers CSV</h3>
          <p className={styles.importSub}>Upload a CSV/TSV with your provided columns to insert data into Supabase.</p>
        </div>
        <label className={styles.importInputWrap}>
          <input type="file" accept=".csv,text/csv,text/plain" className={styles.importInput} onChange={handleImportCsv} disabled={isImporting} />
          <span className={styles.importBtn}>{isImporting ? 'Importing...' : 'Choose CSV File'}</span>
        </label>
      </div>
      {importMessage && <p className={styles.importMessage}>{importMessage}</p>}

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
            {roomOptions.map((room) => (
              <option key={room} value={room}>{room}</option>
            ))}
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

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Language</th>
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
              filtered.map((customer) => (
                <tr key={customer.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.customerCell}>
                      <div className={styles.avatar}>{customer.name.charAt(0)}</div>
                      <div>
                        <div className={styles.customerName}>
                          {customer.isChampion && <i className="bi bi-trophy-fill" style={{ color: '#d4a84b', marginRight: 5 }}></i>}
                          {customer.name}
                        </div>
                        <div className={styles.customerSub}>{customer.totalRooms} bookings</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{customer.phone}</span>
                      <span className={styles.muted}>{customer.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.langBadge}>{customer.language === 'ar' ? '🇸🇦 AR' : '🇺🇸 EN'}</span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: (statusColors[customer.status] || statusColors.win).bg,
                        color: (statusColors[customer.status] || statusColors.win).color,
                      }}
                    >
                      {customer.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {customer.videoRequested ? (
                      <span className={`${styles.videoBadge} ${customer.videoSent ? styles.videoSent : styles.videoPending}`}>
                        {customer.videoSent ? '✓ Sent' : 'Pending'}
                      </span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td className={styles.muted}>{customer.lastVisit}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => setSelectedCustomer(customer)} title="View">
                        <i className="bi bi-eye-fill"></i>
                      </button>
                      <button className={styles.actionBtn} title="Edit">
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deleteCustomer(customer.id)} title="Delete">
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

      {selectedCustomer && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCustomer(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
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
                  <span className={styles.modalLabel}>Total Bookings</span>
                  <span>{selectedCustomer.totalRooms}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Last Visit</span>
                  <span>{selectedCustomer.lastVisit}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Location</span>
                  <span>{[selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(', ') || '—'}</span>
                </div>
              </div>

              {selectedCustomer.alertMessage && (
                <div className={styles.modalSection}>
                  <span className={styles.modalLabel}>Alert</span>
                  <span>{selectedCustomer.alertMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}