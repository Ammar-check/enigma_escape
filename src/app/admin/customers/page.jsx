'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

const PAGE_SIZE = 30;

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

  // Already in ISO date format.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // Handle formats like 23/10/2023, 23-10-2023, 23.10.2023 (optionally with time around it).
  const dayFirstMatch = raw.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (dayFirstMatch) {
    const [, dd, mm, yyyy] = dayFirstMatch;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // Handle formats like 2023/10/23, 2023-10-23, 2023.10.23.
  const yearFirstMatch = raw.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (yearFirstMatch) {
    const [, yyyy, mm, dd] = yearFirstMatch;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // Handle mixed strings where date is split by other chars/time, e.g. "2023 18:30-10-23".
  const compactMatch = raw.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (compactMatch) {
    const [, yyyy, mm, dd] = compactMatch;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // Return null for unrecognized date values to avoid DB type errors.
  return null;
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

  const normalizedEmail = (row.Email || '').trim().toLowerCase();

  return {
    first_name: (row['First name'] || '').trim(),
    last_name: (row['Last name'] || '').trim(),
    full_name: fullName,
    email: normalizedEmail || null,
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

const dedupeCustomersByEmail = (rows) => {
  const byEmail = new Map();
  const withoutEmail = [];

  rows.forEach((row) => {
    const email = String(row.email || '').trim().toLowerCase();
    if (!email) {
      withoutEmail.push(row);
      return;
    }
    // Keep latest row when same email appears multiple times in CSV.
    byEmail.set(email, { ...row, email });
  });

  return {
    withEmail: [...byEmail.values()],
    withoutEmail: withoutEmail.map((row) => ({ ...row, email: null })),
  };
};

const mapDbCustomerToUi = (customer) => ({
  id: customer.id,
  name: customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown',
  phone: customer.primary_phone || customer.phone_mobile || customer.phone_home || customer.phone_work || '—',
  email: customer.email || '—',
  city: customer.city || '—',
  country: customer.country || '—',
  totalBookings: customer.total_bookings || 0,
  cancellations: customer.cancellations || 0,
  noShows: customer.no_shows || 0,
  membershipEnrolled: customer.membership_enrolled || '—',
  memberUntil: customer.member_until || '—',
  membershipRate: customer.membership_rate || '—',
  membershipPausedFrom: customer.membership_paused_from || '—',
  membershipPausedUntil: customer.membership_paused_until || '—',
  membershipNextPayment: customer.membership_next_payment || '—',
  lastVisit: customer.last_visit || '—',
  nextVisit: customer.next_visit || '—',
  mailingList: Boolean(customer.mailing_list),
  requireApproval: Boolean(customer.require_approval),
  credit: customer.credit ?? 0,
  status: customer.status || '—',
  isChampion: Boolean(customer.is_champion),
  videoRequested: Boolean(customer.video_requested),
  videoSent: Boolean(customer.video_sent),
  rooms: Array.isArray(customer.rooms) ? customer.rooms : [],
  gender: customer.gender || '—',
  dateOfBirth: customer.date_of_birth || '—',
  address1: customer.address_1 || '—',
  address2: customer.address_2 || '',
  stateProvince: customer.state_province || '—',
  zipPostcode: customer.zip_postcode || '—',
  alertMessage: customer.alert_message || '',
});

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const fetchCustomers = async (page = currentPage, searchTerm = search) => {
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const normalizedSearch = String(searchTerm || '').trim().replace(/,/g, ' ');
      const like = `%${normalizedSearch}%`;

      let query = supabase.from('customers').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (normalizedSearch) {
        query = query.or(
          `full_name.ilike.${like},first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},primary_phone.ilike.${like},city.ilike.${like},country.ilike.${like}`
        );
      }

      const { data, error, count } = await query.range(from, to);
      if (error) {
        console.error('Error loading customers:', error);
        setImportMessage(`Load failed: ${error.message}`);
        return;
      }

      setCustomers((data || []).map(mapDbCustomerToUi));
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Unexpected loading error:', error);
      setImportMessage('Unable to load customers from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const filtered = customers;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageWindow = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) => pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 2
  );
  const visiblePageNumbers = pageWindow.filter((pageNumber, index) => pageWindow[index - 1] !== pageNumber - 1);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const openEditModal = (customer) => {
    setEditingCustomer({
      id: customer.id,
      first_name: customer.name.split(' ').slice(0, -1).join(' ') || customer.name,
      last_name: customer.name.split(' ').slice(-1).join(' ') || '',
      email: customer.email === '—' ? '' : customer.email,
      primary_phone: customer.phone === '—' ? '' : customer.phone,
      city: customer.city === '—' ? '' : customer.city,
      country: customer.country === '—' ? '' : customer.country,
      gender: customer.gender === '—' ? '' : customer.gender,
      total_bookings: customer.totalBookings || 0,
      cancellations: customer.cancellations || 0,
      no_shows: customer.noShows || 0,
      membership_enrolled: customer.membershipEnrolled === '—' ? '' : customer.membershipEnrolled,
      member_until: customer.memberUntil === '—' ? '' : customer.memberUntil,
      membership_rate: customer.membershipRate === '—' ? '' : customer.membershipRate,
      membership_next_payment: customer.membershipNextPayment === '—' ? '' : customer.membershipNextPayment,
      membership_paused_from: customer.membershipPausedFrom === '—' ? '' : customer.membershipPausedFrom,
      membership_paused_until: customer.membershipPausedUntil === '—' ? '' : customer.membershipPausedUntil,
      address_1: customer.address1 === '—' ? '' : customer.address1,
      address_2: customer.address2 || '',
      state_province: customer.stateProvince === '—' ? '' : customer.stateProvince,
      zip_postcode: customer.zipPostcode === '—' ? '' : customer.zipPostcode,
      credit: Number(customer.credit) || 0,
      status: customer.status === '—' ? 'win' : customer.status,
      video_requested: Boolean(customer.videoRequested),
      video_sent: Boolean(customer.videoSent),
      rooms: Array.isArray(customer.rooms) ? customer.rooms.join(', ') : '',
      require_approval: Boolean(customer.requireApproval),
      alert_message: customer.alertMessage || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditingCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer?.id) return;
    setIsSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const firstName = String(editingCustomer.first_name || '').trim();
      const lastName = String(editingCustomer.last_name || '').trim();
      const fullName = `${firstName} ${lastName}`.trim();

      const payload = {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName || null,
        email: String(editingCustomer.email || '').trim().toLowerCase() || null,
        primary_phone: String(editingCustomer.primary_phone || '').trim() || null,
        city: String(editingCustomer.city || '').trim() || null,
        country: String(editingCustomer.country || '').trim() || null,
        gender: String(editingCustomer.gender || '').trim() || null,
        total_bookings: Number(editingCustomer.total_bookings) || 0,
        cancellations: Number(editingCustomer.cancellations) || 0,
        no_shows: Number(editingCustomer.no_shows) || 0,
        membership_enrolled: String(editingCustomer.membership_enrolled || '').trim() || null,
        member_until: String(editingCustomer.member_until || '').trim() || null,
        membership_rate: String(editingCustomer.membership_rate || '').trim() || null,
        membership_next_payment: String(editingCustomer.membership_next_payment || '').trim() || null,
        membership_paused_from: String(editingCustomer.membership_paused_from || '').trim() || null,
        membership_paused_until: String(editingCustomer.membership_paused_until || '').trim() || null,
        address_1: String(editingCustomer.address_1 || '').trim() || null,
        address_2: String(editingCustomer.address_2 || '').trim() || null,
        state_province: String(editingCustomer.state_province || '').trim() || null,
        zip_postcode: String(editingCustomer.zip_postcode || '').trim() || null,
        credit: Number(editingCustomer.credit) || 0,
        status: String(editingCustomer.status || '').trim() || 'win',
        is_champion: String(editingCustomer.status || '').trim() === 'champion',
        video_requested: Boolean(editingCustomer.video_requested),
        video_sent: Boolean(editingCustomer.video_sent),
        rooms: String(editingCustomer.rooms || '')
          .split(',')
          .map((room) => room.trim())
          .filter(Boolean),
        require_approval: Boolean(editingCustomer.require_approval),
        alert_message: String(editingCustomer.alert_message || '').trim() || null,
      };

      const { data, error } = await supabase.from('customers').update(payload).eq('id', editingCustomer.id).select('*').single();
      if (error) {
        setImportMessage(`Update failed: ${error.message}`);
        return;
      }

      const updated = mapDbCustomerToUi(data);
      setCustomers((prev) => prev.map((customer) => (customer.id === updated.id ? updated : customer)));
      setSelectedCustomer((prev) => (prev?.id === updated.id ? updated : prev));
      setEditingCustomer(null);
      setImportMessage('Customer updated successfully.');
    } catch (error) {
      console.error('Update customer error:', error);
      setImportMessage('Update failed due to unexpected error.');
    } finally {
      setIsSaving(false);
    }
  };

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

      const mappedRows = rows.map(mapCsvRowToDbCustomer);
      const { withEmail, withoutEmail } = dedupeCustomersByEmail(mappedRows);
      const importedRows = [];

      if (withEmail.length > 0) {
        const { data, error } = await supabase
          .from('customers')
          .upsert(withEmail, { onConflict: 'email' })
          .select('*');
        if (error) {
          console.error('Import upsert error:', error);
          setImportMessage(`Import failed: ${error.message}`);
          return;
        }
        importedRows.push(...(data || []));
      }

      if (withoutEmail.length > 0) {
        const { data, error } = await supabase.from('customers').insert(withoutEmail).select('*');
        if (error) {
          console.error('Import insert error (no-email rows):', error);
          setImportMessage(`Import failed: ${error.message}`);
          return;
        }
        importedRows.push(...(data || []));
      }

      const inserted = importedRows.map(mapDbCustomerToUi);
      if (currentPage !== 1) setCurrentPage(1);
      await fetchCustomers(1, search);
      setImportMessage(
        `${inserted.length} customers imported successfully.` +
          (withoutEmail.length > 0 ? ` (${withoutEmail.length} rows saved without email)` : '')
      );
    } catch (error) {
      console.error('CSV import failure:', error);
      setImportMessage('Import failed due to unexpected error.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'City', 'Country', 'Total bookings', 'Cancellations', 'No-shows', 'Last visit', 'Next visit'];
    const rows = filtered.map((customer) => [
      customer.name,
      customer.email,
      customer.phone,
      customer.city,
      customer.country,
      customer.totalBookings,
      customer.cancellations,
      customer.noShows,
      customer.lastVisit,
      customer.nextVisit,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    link.click();
  };

  const deleteCustomer = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        setImportMessage(`Delete failed: ${error.message}`);
        return;
      }
      await fetchCustomers(currentPage, search);
    } catch (error) {
      console.error('Delete failure:', error);
      setImportMessage('Delete failed due to unexpected error.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSub}>{loading ? 'Loading customers...' : `${totalCount} records found`}</p>
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
            placeholder="Search by name, phone, email, city or country..."
            value={search}
            onChange={async (e) => {
              const nextValue = e.target.value;
              setSearch(nextValue);
              if (currentPage !== 1) {
                setCurrentPage(1);
              } else {
                await fetchCustomers(1, nextValue);
              }
            }}
            className={styles.searchInput}
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={async () => {
                setSearch('');
                if (currentPage !== 1) {
                  setCurrentPage(1);
                } else {
                  await fetchCustomers(1, '');
                }
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Bookings</th>
              <th>Membership</th>
              <th>Status</th>
              <th>Video</th>
              <th>Rooms</th>
              <th>Approval</th>
              <th>Visits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className={styles.noResults}>No customers found</td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.customerCell}>
                      <div className={styles.avatar}>{customer.name.charAt(0)}</div>
                      <div>
                        <div className={styles.customerName}>{customer.name}</div>
                        <div className={styles.customerSub}>{customer.gender}</div>
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
                    <span>{[customer.city, customer.country].filter((value) => value && value !== '—').join(', ') || '—'}</span>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{customer.totalBookings} total</span>
                      <span className={styles.muted}>{customer.cancellations} cancels / {customer.noShows} no-shows</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{customer.membershipEnrolled}</span>
                      <span className={styles.muted}>Until: {customer.memberUntil}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.muted}>{customer.status}{customer.isChampion ? ' (champion)' : ''}</span>
                  </td>
                  <td>
                    <span className={styles.muted}>{customer.videoSent ? 'Sent' : customer.videoRequested ? 'Requested' : 'Not requested'}</span>
                  </td>
                  <td>
                    <span className={styles.muted}>{customer.rooms.length > 0 ? customer.rooms.join(', ') : '—'}</span>
                  </td>
                  <td>
                    <span className={styles.muted}>{customer.requireApproval ? 'Required' : 'No'}</span>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>Last: {customer.lastVisit}</span>
                      <span className={styles.muted}>Next: {customer.nextVisit}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => setSelectedCustomer(customer)} title="View">
                        <i className="bi bi-eye-fill"></i>
                      </button>
                      <button className={styles.actionBtn} onClick={() => openEditModal(customer)} title="Edit">
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

      <div className={styles.pagination}>
        <button className={styles.pageBtn} disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}>
          Prev
        </button>
        <div className={styles.pageNumbers}>
          {visiblePageNumbers.map((pageNumber, index) => {
            const previous = visiblePageNumbers[index - 1];
            const hasGap = previous && pageNumber - previous > 1;
            return (
              <span key={pageNumber}>
                {hasGap && <span className={styles.pageDots}>...</span>}
                <button
                  className={`${styles.pageNumberBtn} ${pageNumber === currentPage ? styles.pageNumberActive : ''}`}
                  disabled={loading}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              </span>
            );
          })}
        </div>
        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className={styles.pageBtn}
          disabled={currentPage >= totalPages || loading}
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
        <div className={styles.pageJump}>
          <input
            type="number"
            min={1}
            max={totalPages}
            className={styles.pageJumpInput}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="Page #"
          />
          <button
            className={styles.pageBtn}
            disabled={loading}
            onClick={() => {
              const target = Number.parseInt(pageInput, 10);
              if (!Number.isInteger(target)) return;
              const clamped = Math.min(totalPages, Math.max(1, target));
              setCurrentPage(clamped);
            }}
          >
            Go
          </button>
        </div>
      </div>

      {selectedCustomer && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCustomer(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedCustomer.name}</h3>
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
                  <span className={styles.modalLabel}>Gender</span>
                  <span>{selectedCustomer.gender}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Total Bookings</span>
                  <span>{selectedCustomer.totalBookings}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Cancellations / No-shows</span>
                  <span>{selectedCustomer.cancellations} / {selectedCustomer.noShows}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Location</span>
                  <span>{[selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Address</span>
                  <span>{[selectedCustomer.address1, selectedCustomer.address2].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>State / ZIP</span>
                  <span>{`${selectedCustomer.stateProvince} / ${selectedCustomer.zipPostcode}`}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Date of Birth</span>
                  <span>{selectedCustomer.dateOfBirth}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership</span>
                  <span>{selectedCustomer.membershipEnrolled}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Member Until</span>
                  <span>{selectedCustomer.memberUntil}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Rate</span>
                  <span>{selectedCustomer.membershipRate}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Next Payment</span>
                  <span>{selectedCustomer.membershipNextPayment}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Pause</span>
                  <span>{selectedCustomer.membershipPausedFrom} / {selectedCustomer.membershipPausedUntil}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Mailing List</span>
                  <span>{selectedCustomer.mailingList ? 'Yes' : 'No'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Require Approval</span>
                  <span>{selectedCustomer.requireApproval ? 'Yes' : 'No'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Credit</span>
                  <span>{selectedCustomer.credit}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Status</span>
                  <span>{selectedCustomer.status}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Video</span>
                  <span>{selectedCustomer.videoSent ? 'Sent' : selectedCustomer.videoRequested ? 'Requested' : 'Not requested'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Rooms</span>
                  <span>{selectedCustomer.rooms.length > 0 ? selectedCustomer.rooms.join(', ') : '—'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Last / Next Visit</span>
                  <span>{selectedCustomer.lastVisit} / {selectedCustomer.nextVisit}</span>
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

      {editingCustomer && (
        <div className={styles.modalOverlay} onClick={() => setEditingCustomer(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Customer</h3>
              <button className={styles.modalClose} onClick={() => setEditingCustomer(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>First Name</span>
                  <input className={styles.editInput} value={editingCustomer.first_name} onChange={(e) => handleEditChange('first_name', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Last Name</span>
                  <input className={styles.editInput} value={editingCustomer.last_name} onChange={(e) => handleEditChange('last_name', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Email</span>
                  <input className={styles.editInput} value={editingCustomer.email} onChange={(e) => handleEditChange('email', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Phone</span>
                  <input className={styles.editInput} value={editingCustomer.primary_phone} onChange={(e) => handleEditChange('primary_phone', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>City</span>
                  <input className={styles.editInput} value={editingCustomer.city} onChange={(e) => handleEditChange('city', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Country</span>
                  <input className={styles.editInput} value={editingCustomer.country} onChange={(e) => handleEditChange('country', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Total Bookings</span>
                  <input
                    type="number"
                    className={styles.editInput}
                    value={editingCustomer.total_bookings}
                    onChange={(e) => handleEditChange('total_bookings', e.target.value)}
                  />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Cancellations</span>
                  <input
                    type="number"
                    className={styles.editInput}
                    value={editingCustomer.cancellations}
                    onChange={(e) => handleEditChange('cancellations', e.target.value)}
                  />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>No Shows</span>
                  <input type="number" className={styles.editInput} value={editingCustomer.no_shows} onChange={(e) => handleEditChange('no_shows', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Enrolled</span>
                  <input
                    className={styles.editInput}
                    value={editingCustomer.membership_enrolled}
                    onChange={(e) => handleEditChange('membership_enrolled', e.target.value)}
                  />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Member Until</span>
                  <input type="date" className={styles.editInput} value={editingCustomer.member_until || ''} onChange={(e) => handleEditChange('member_until', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Rate</span>
                  <input className={styles.editInput} value={editingCustomer.membership_rate} onChange={(e) => handleEditChange('membership_rate', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Next Payment</span>
                  <input
                    type="date"
                    className={styles.editInput}
                    value={editingCustomer.membership_next_payment || ''}
                    onChange={(e) => handleEditChange('membership_next_payment', e.target.value)}
                  />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Paused From</span>
                  <input
                    type="date"
                    className={styles.editInput}
                    value={editingCustomer.membership_paused_from || ''}
                    onChange={(e) => handleEditChange('membership_paused_from', e.target.value)}
                  />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Membership Paused Until</span>
                  <input
                    type="date"
                    className={styles.editInput}
                    value={editingCustomer.membership_paused_until || ''}
                    onChange={(e) => handleEditChange('membership_paused_until', e.target.value)}
                  />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Address 1</span>
                  <input className={styles.editInput} value={editingCustomer.address_1} onChange={(e) => handleEditChange('address_1', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Address 2</span>
                  <input className={styles.editInput} value={editingCustomer.address_2} onChange={(e) => handleEditChange('address_2', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>State / Province</span>
                  <input className={styles.editInput} value={editingCustomer.state_province} onChange={(e) => handleEditChange('state_province', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Zip / Postcode</span>
                  <input className={styles.editInput} value={editingCustomer.zip_postcode} onChange={(e) => handleEditChange('zip_postcode', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Gender</span>
                  <input className={styles.editInput} value={editingCustomer.gender} onChange={(e) => handleEditChange('gender', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Credit</span>
                  <input type="number" step="0.01" className={styles.editInput} value={editingCustomer.credit} onChange={(e) => handleEditChange('credit', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Status</span>
                  <select className={styles.editInput} value={editingCustomer.status} onChange={(e) => handleEditChange('status', e.target.value)}>
                    <option value="win">win</option>
                    <option value="lose">lose</option>
                    <option value="champion">champion</option>
                  </select>
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Video Requested</span>
                  <select
                    className={styles.editInput}
                    value={editingCustomer.video_requested ? 'yes' : 'no'}
                    onChange={(e) => handleEditChange('video_requested', e.target.value === 'yes')}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Video Sent</span>
                  <select
                    className={styles.editInput}
                    value={editingCustomer.video_sent ? 'yes' : 'no'}
                    onChange={(e) => handleEditChange('video_sent', e.target.value === 'yes')}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Rooms (comma separated)</span>
                  <input className={styles.editInput} value={editingCustomer.rooms} onChange={(e) => handleEditChange('rooms', e.target.value)} />
                </label>
                <label className={styles.modalItem}>
                  <span className={styles.modalLabel}>Require Approval</span>
                  <select
                    className={styles.editInput}
                    value={editingCustomer.require_approval ? 'yes' : 'no'}
                    onChange={(e) => handleEditChange('require_approval', e.target.value === 'yes')}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
              </div>
              <label className={styles.modalItem}>
                <span className={styles.modalLabel}>Alert Message</span>
                <textarea className={styles.editTextarea} value={editingCustomer.alert_message} onChange={(e) => handleEditChange('alert_message', e.target.value)} />
              </label>
              <div className={styles.modalActions}>
                <button className={styles.secondaryBtn} onClick={() => setEditingCustomer(null)} disabled={isSaving}>
                  Cancel
                </button>
                <button className={styles.exportBtn} onClick={handleUpdateCustomer} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}