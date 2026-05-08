'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

const PAGE_SIZE = 30;

const statusColors = {
  confirmed: { bg: 'rgba(30,136,229,0.15)', color: '#1e88e5' },
  completed: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  cancelled: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
  booked: { bg: 'rgba(30,136,229,0.15)', color: '#1e88e5' },
  checked_in: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  no_show: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
  canceled: { bg: 'rgba(244,67,54,0.15)', color: '#f44336' },
};

const toBool = (value) => ['true', 'yes', '1'].includes(String(value || '').trim().toLowerCase());
const toInt = (value) => {
  const n = Number.parseInt(String(value || '').trim(), 10);
  return Number.isNaN(n) ? 0 : n;
};
const toFloat = (value) => {
  const n = Number.parseFloat(String(value || '').trim());
  return Number.isNaN(n) ? 0 : n;
};
const normalizeDate = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dayFirst = raw.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (dayFirst) {
    const [, dd, mm, yyyy] = dayFirst;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  const yearFirst = raw.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (yearFirst) {
    const [, yyyy, mm, dd] = yearFirst;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return null;
};
const normalizeDateTime = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const maybeDate = normalizeDate(raw);
  if (maybeDate) return `${maybeDate}T00:00:00`;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
};
const parseCsvLine = (line, delimiter) => {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
};
const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length <= 1) return [];
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = parseCsvLine(lines[0], delimiter);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });
};
const mapCsvRowToDbBooking = (row) => ({
  booking_number: String(row['Booking number'] || '').trim() || null,
  start_at: normalizeDateTime(row.Start),
  end_at: normalizeDateTime(row.End),
  first_name: String(row['First name'] || '').trim(),
  last_name: String(row['Last name'] || '').trim(),
  email_address: String(row['Email address'] || '').trim().toLowerCase() || null,
  phone: String(row.Phone || '').trim() || null,
  participants: toInt(row.Participants),
  adults: toInt(row.Adults),
  participants_details: String(row['Participants (details)'] || '').trim() || null,
  tour: String(row.Tour || '').trim() || null,
  product_code: String(row['Product code'] || '').trim() || null,
  private_event: toBool(row['Private event']),
  status: String(row.Status || '').trim().toLowerCase() || 'booked',
  missing_waivers: toInt(row['Missing waivers']),
  promotion: String(row.Promotion || '').trim() || null,
  number_of_coupons: toInt(row['Number of coupons']),
  coupons: String(row.Coupons || '').trim() || null,
  specific_gift_voucher: String(row['Specific gift voucher'] || '').trim() || null,
  prepaid_credits: toFloat(row['Prepaid credits']),
  prepaid_package: String(row['Prepaid package'] || '').trim() || null,
  adjustments: String(row.Adjustments || '').trim() || null,
  total_adjustments: toFloat(row['Total adjustments']),
  total_net: toFloat(row['Total net']),
  vat: toFloat(row.VAT),
  total_gross: toFloat(row['Total gross']),
  total_paid: toFloat(row['Total paid']),
  total_due: toFloat(row['Total due']),
  participants_names: String(row['Participants (names)'] || '').trim() || null,
  created_at_source: normalizeDateTime(row.Created),
  created_by: String(row['Created by'] || '').trim() || null,
  last_changed_at: normalizeDateTime(row['Last changed']),
  last_changed_by: String(row['Last changed by'] || '').trim() || null,
  canceled: toBool(row.Canceled),
  canceled_by: String(row['Canceled by'] || '').trim() || null,
  reschedule_until: normalizeDate(row['Reschedule until']),
  source: String(row.Source || '').trim() || null,
  ip_address: String(row['IP address'] || '').trim() || null,
  external_ref: String(row['External ref.'] || '').trim() || null,
  alert: String(row.Alert || '').trim() || null,
  customer_telephone_home: String(row['Customer - Telephone (home)'] || '').trim() || null,
  customer_telephone_work: String(row['Customer - Telephone (work)'] || '').trim() || null,
  customer_telephone_mobile: String(row['Customer - Telephone (mobile)'] || '').trim() || null,
  customer_address_1: String(row['Customer - Address 1'] || '').trim() || null,
  customer_address_2: String(row['Customer - Address 2'] || '').trim() || null,
  customer_city: String(row['Customer - City'] || '').trim() || null,
  customer_state_province: String(row['Customer - State/Province'] || '').trim() || null,
  customer_zip_postcode: String(row['Customer - Zip/Postcode'] || '').trim() || null,
  customer_country: String(row['Customer - Country'] || '').trim() || null,
  customer_gender: String(row['Customer - Gender'] || '').trim() || null,
  customer_date_of_birth: normalizeDate(row['Customer - Date of birth']),
  customer_created: normalizeDateTime(row['Customer - Created']),
  customer_total_bookings: toInt(row['Customer - Total bookings']),
  customer_cancellations: toInt(row['Customer - Cancellations']),
  customer_no_shows: toInt(row['Customer - No-shows']),
  customer_mailing_list: toBool(row['Customer - Mailing list']),
  customer_credit: toFloat(row['Customer - Credit']),
  customer_membership_enrolled: String(row['Customer - Membership enrolled'] || '').trim() || null,
  customer_member_until: normalizeDate(row['Customer - Member until']),
  customer_membership_rate: String(row['Customer - Membership rate'] || '').trim() || null,
  customer_membership_paused_from: normalizeDate(row['Customer - Membership paused from']),
  customer_membership_paused_until: normalizeDate(row['Customer - Membership paused until']),
  customer_membership_next_payment: normalizeDate(row['Customer - Membership next payment']),
  customer_last_visit: normalizeDate(row['Customer - Last visit']),
  customer_next_visit: normalizeDate(row['Customer - Next visit']),
  customer_alert_message: String(row['Customer - Alert message'] || '').trim() || null,
  customer_require_approval: toBool(row['Customer - Require approval']),
});
const mapDbBookingToUi = (b) => ({
  id: b.id,
  bookingNumber: b.booking_number || '—',
  name: `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Unknown',
  phone: b.phone || b.customer_telephone_mobile || b.customer_telephone_home || b.customer_telephone_work || '—',
  email: b.email_address || '—',
  tour: b.tour || '—',
  productCode: b.product_code || '—',
  startAt: b.start_at || null,
  endAt: b.end_at || null,
  participants: b.participants ?? 0,
  adults: b.adults ?? 0,
  participantsDetails: b.participants_details || '—',
  participantsNames: b.participants_names || '—',
  privateEvent: Boolean(b.private_event),
  missingWaivers: b.missing_waivers ?? 0,
  prepaidCredits: b.prepaid_credits ?? 0,
  prepaidPackage: b.prepaid_package || '—',
  totalNet: b.total_net ?? 0,
  vat: b.vat ?? 0,
  status: b.status || 'booked',
  source: b.source || '—',
  totalGross: b.total_gross ?? 0,
  totalPaid: b.total_paid ?? 0,
  totalDue: b.total_due ?? 0,
  customerAddress: [b.customer_address_1, b.customer_address_2, b.customer_city, b.customer_state_province, b.customer_zip_postcode, b.customer_country]
    .filter(Boolean)
    .join(', ') || '—',
  customerHome: b.customer_telephone_home || '—',
  customerWork: b.customer_telephone_work || '—',
  customerMobile: b.customer_telephone_mobile || '—',
  customerGender: b.customer_gender || '—',
  customerDob: b.customer_date_of_birth || '—',
  customerTotalBookings: b.customer_total_bookings ?? 0,
  customerCancellations: b.customer_cancellations ?? 0,
  customerNoShows: b.customer_no_shows ?? 0,
  customerCredit: b.customer_credit ?? 0,
  customerMembershipEnrolled: b.customer_membership_enrolled || '—',
  customerMemberUntil: b.customer_member_until || '—',
  customerMembershipRate: b.customer_membership_rate || '—',
  customerRequireApproval: Boolean(b.customer_require_approval),
  createdBy: b.created_by || '—',
  createdAtSource: b.created_at_source || null,
  lastChangedBy: b.last_changed_by || '—',
  lastChangedAt: b.last_changed_at || null,
  alert: b.alert || b.customer_alert_message || '',
});
const toCsvValue = (value) => {
  const raw = value == null ? '' : String(value);
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailTab, setDetailTab] = useState('booking');
  const [customerDraft, setCustomerDraft] = useState(null);
  const [linkedCustomer, setLinkedCustomer] = useState(null);
  const [relatedBookings, setRelatedBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [importMessage, setImportMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    today: 0,
    confirmed: 0,
    cancelled: 0,
    total: 0,
  });

  const fetchOverviewStats = async () => {
    const { supabase } = await import('@/lib/supabase');
    const todayIso = new Date().toISOString().slice(0, 10);
    const [totalRes, todayRes, confirmedRes, cancelledRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('start_at', `${todayIso}T00:00:00`)
        .lt('start_at', `${todayIso}T23:59:59`),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('status', ['booked', 'confirmed', 'checked_in', 'completed']),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('status', ['canceled', 'cancelled']),
    ]);

    setOverviewStats({
      today: todayRes.count || 0,
      confirmed: confirmedRes.count || 0,
      cancelled: cancelledRes.count || 0,
      total: totalRes.count || 0,
    });
  };

  const fetchBookings = async (page = currentPage, searchTerm = search, room = filterRoom, status = filterStatus, date = filterDate) => {
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const normalizedSearch = String(searchTerm || '').trim().replace(/,/g, ' ');
      const like = `%${normalizedSearch}%`;
      let query = supabase.from('bookings').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (normalizedSearch) {
        query = query.or(
          `booking_number.ilike.${like},first_name.ilike.${like},last_name.ilike.${like},email_address.ilike.${like},phone.ilike.${like},tour.ilike.${like},product_code.ilike.${like},source.ilike.${like}`
        );
      }
      if (room !== 'all') query = query.ilike('tour', room);
      if (status !== 'all') query = query.eq('status', status);
      if (date) query = query.gte('start_at', `${date}T00:00:00`).lt('start_at', `${date}T23:59:59`);
      const { data, error, count } = await query.range(from, to);
      if (error) {
        setImportMessage(`Load failed: ${error.message}`);
        return;
      }
      setBookings((data || []).map(mapDbBookingToUi));
      setSelectedIds([]);
      setTotalCount(count || 0);
      await fetchOverviewStats();
    } catch (error) {
      console.error('Bookings load error:', error);
      setImportMessage('Unable to load bookings from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(currentPage, search, filterRoom, filterStatus, filterDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const filtered = bookings;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const roomOptions = useMemo(
    () => Array.from(new Set(bookings.map((booking) => booking.tour).filter((tour) => tour && tour !== '—'))),
    [bookings]
  );

  const getHistoryKey = (bookingId) => `booking_history_${bookingId}`;
  const readHistory = (bookingId) => {
    if (!bookingId) return [];
    try {
      const raw = localStorage.getItem(getHistoryKey(bookingId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const appendHistory = (bookingId, action, message) => {
    if (!bookingId) return;
    try {
      const current = readHistory(bookingId);
      const next = [{ at: new Date().toISOString(), action, message }, ...current].slice(0, 100);
      localStorage.setItem(getHistoryKey(bookingId), JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  };

  const updateStatus = async (id, status) => {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      setImportMessage(`Status update failed: ${error.message}`);
      return;
    }
    setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
    setSelectedBooking((prev) => (prev?.id === id ? { ...prev, status } : prev));
    appendHistory(id, 'status_update', `Status changed to "${status}"`);
  };

  const deleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      setImportMessage(`Delete failed: ${error.message}`);
      return;
    }
    appendHistory(id, 'delete', 'Booking deleted');
    await fetchBookings(currentPage, search, filterRoom, filterStatus, filterDate);
    setSelectedBooking(null);
  };

  const deleteSelectedBookings = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected bookings?`)) return;
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('bookings').delete().in('id', selectedIds);
    if (error) {
      setImportMessage(`Bulk delete failed: ${error.message}`);
      return;
    }
    selectedIds.forEach((id) => appendHistory(id, 'bulk_delete', 'Deleted via multi-select'));
    await fetchBookings(currentPage, search, filterRoom, filterStatus, filterDate);
  };

  const openEditModal = (booking) => {
    setIsCreatingBooking(false);
    setEditingBooking({
      id: booking.id,
      booking_number: booking.bookingNumber === '—' ? '' : booking.bookingNumber,
      first_name: booking.name === 'Unknown' ? '' : booking.name.split(' ').slice(0, -1).join(' '),
      last_name: booking.name === 'Unknown' ? '' : booking.name.split(' ').slice(-1).join(' '),
      email_address: booking.email === '—' ? '' : booking.email,
      phone: booking.phone === '—' ? '' : booking.phone,
      tour: booking.tour === '—' ? '' : booking.tour,
      product_code: booking.productCode === '—' ? '' : booking.productCode,
      participants: booking.participants,
      adults: booking.adults,
      status: booking.status || 'booked',
      source: booking.source === '—' ? '' : booking.source,
      total_gross: booking.totalGross,
      total_paid: booking.totalPaid,
      total_due: booking.totalDue,
      alert: booking.alert || '',
    });
  };

  const openCreateModal = () => {
    setIsCreatingBooking(true);
    setEditingBooking({
      booking_number: '',
      first_name: '',
      last_name: '',
      email_address: '',
      phone: '',
      tour: '',
      product_code: '',
      participants: 0,
      adults: 0,
      status: 'booked',
      source: '',
      total_gross: 0,
      total_paid: 0,
      total_due: 0,
      alert: '',
    });
  };

  const handleEditChange = (field, value) => setEditingBooking((prev) => ({ ...prev, [field]: value }));

  const saveBooking = async () => {
    const { supabase } = await import('@/lib/supabase');
    const payload = {
      booking_number: editingBooking.booking_number || null,
      first_name: editingBooking.first_name || null,
      last_name: editingBooking.last_name || null,
      email_address: (editingBooking.email_address || '').toLowerCase() || null,
      phone: editingBooking.phone || null,
      tour: editingBooking.tour || null,
      product_code: editingBooking.product_code || null,
      participants: Number(editingBooking.participants) || 0,
      adults: Number(editingBooking.adults) || 0,
      status: editingBooking.status || 'booked',
      source: editingBooking.source || null,
      total_gross: Number(editingBooking.total_gross) || 0,
      total_paid: Number(editingBooking.total_paid) || 0,
      total_due: Number(editingBooking.total_due) || 0,
      alert: editingBooking.alert || null,
    };
    let data;
    let error;
    if (isCreatingBooking) {
      ({ data, error } = await supabase.from('bookings').insert(payload).select('*').single());
    } else {
      ({ data, error } = await supabase.from('bookings').update(payload).eq('id', editingBooking.id).select('*').single());
    }
    if (error) {
      setImportMessage(`Update failed: ${error.message}`);
      return;
    }
    const updated = mapDbBookingToUi(data);
    if (isCreatingBooking) {
      setBookings((prev) => [updated, ...prev]);
      appendHistory(updated.id, 'create', 'Booking created');
      setImportMessage('Booking created successfully.');
    } else {
      setBookings((prev) => prev.map((booking) => (booking.id === updated.id ? updated : booking)));
      appendHistory(updated.id, 'update', 'Booking updated');
      setImportMessage('Booking updated successfully.');
    }
    setEditingBooking(null);
    setIsCreatingBooking(false);
  };

  const printBooking = (booking) => {
    if (!booking) return;
    const html = `
      <html><head><title>Booking ${booking.bookingNumber}</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h2>Booking #${booking.bookingNumber}</h2>
        <p><strong>Customer:</strong> ${booking.name}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Tour:</strong> ${booking.tour}</p>
        <p><strong>Start:</strong> ${booking.startAt ? new Date(booking.startAt).toLocaleString() : '-'}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Participants:</strong> ${booking.participants} (${booking.adults} adults)</p>
        <p><strong>Payment:</strong> Gross ${booking.totalGross} / Paid ${booking.totalPaid} / Due ${booking.totalDue}</p>
        <p><strong>Address:</strong> ${booking.customerAddress}</p>
        <p><strong>Alert/Notes:</strong> ${booking.alert || '-'}</p>
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const openCustomerTab = (booking) => {
    setDetailTab('customer');
    setCustomerDraft({
      id: booking.id,
      customer_telephone_home: booking.customerHome === '—' ? '' : booking.customerHome,
      customer_telephone_work: booking.customerWork === '—' ? '' : booking.customerWork,
      customer_telephone_mobile: booking.customerMobile === '—' ? '' : booking.customerMobile,
      customer_address_1: booking.customerAddress === '—' ? '' : booking.customerAddress,
      customer_gender: booking.customerGender === '—' ? '' : booking.customerGender,
      customer_total_bookings: booking.customerTotalBookings,
      customer_cancellations: booking.customerCancellations,
      customer_no_shows: booking.customerNoShows,
      customer_credit: booking.customerCredit,
      customer_membership_enrolled: booking.customerMembershipEnrolled === '—' ? '' : booking.customerMembershipEnrolled,
      customer_member_until: booking.customerMemberUntil === '—' ? '' : booking.customerMemberUntil,
      customer_membership_rate: booking.customerMembershipRate === '—' ? '' : booking.customerMembershipRate,
      customer_require_approval: booking.customerRequireApproval,
    });
  };

  useEffect(() => {
    const loadRelatedContext = async () => {
      if (!selectedBooking?.id) {
        setRelatedBookings([]);
        setLinkedCustomer(null);
        return;
      }
      const { supabase } = await import('@/lib/supabase');

      const filters = [];
      if (selectedBooking.email && selectedBooking.email !== '—') {
        filters.push(`email_address.eq.${selectedBooking.email}`);
      }
      if (selectedBooking.phone && selectedBooking.phone !== '—') {
        filters.push(`phone.eq.${selectedBooking.phone}`);
      }

      if (filters.length > 0) {
        const { data } = await supabase
          .from('bookings')
          .select('id, booking_number, start_at, end_at, status, tour, total_gross, total_paid, total_due')
          .or(filters.join(','))
          .order('start_at', { ascending: false })
          .limit(20);
        const related = (data || []).filter((booking) => booking.id !== selectedBooking.id);
        setRelatedBookings(related);
      } else {
        setRelatedBookings([]);
      }

      if (selectedBooking.email && selectedBooking.email !== '—') {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('email', selectedBooking.email)
          .maybeSingle();
        setLinkedCustomer(data || null);
      } else {
        setLinkedCustomer(null);
      }
    };

    loadRelatedContext();
  }, [selectedBooking]);

  const saveCustomerDraft = async () => {
    if (!customerDraft?.id) return;
    const { supabase } = await import('@/lib/supabase');
    const payload = {
      customer_telephone_home: customerDraft.customer_telephone_home || null,
      customer_telephone_work: customerDraft.customer_telephone_work || null,
      customer_telephone_mobile: customerDraft.customer_telephone_mobile || null,
      customer_address_1: customerDraft.customer_address_1 || null,
      customer_gender: customerDraft.customer_gender || null,
      customer_total_bookings: Number(customerDraft.customer_total_bookings) || 0,
      customer_cancellations: Number(customerDraft.customer_cancellations) || 0,
      customer_no_shows: Number(customerDraft.customer_no_shows) || 0,
      customer_credit: Number(customerDraft.customer_credit) || 0,
      customer_membership_enrolled: customerDraft.customer_membership_enrolled || null,
      customer_member_until: customerDraft.customer_member_until || null,
      customer_membership_rate: customerDraft.customer_membership_rate || null,
      customer_require_approval: Boolean(customerDraft.customer_require_approval),
    };
    const { data, error } = await supabase.from('bookings').update(payload).eq('id', customerDraft.id).select('*').single();
    if (error) {
      setImportMessage(`Customer update failed: ${error.message}`);
      return;
    }
    const updated = mapDbBookingToUi(data);
    setBookings((prev) => prev.map((booking) => (booking.id === updated.id ? updated : booking)));
    setSelectedBooking(updated);
    appendHistory(updated.id, 'customer_update', 'Customer details updated from booking popup');
    setImportMessage('Customer details updated.');
  };

  const saveNotes = async () => {
    if (!selectedBooking?.id) return;
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('bookings')
      .update({ alert: selectedBooking.alert || null, customer_alert_message: selectedBooking.alert || null })
      .eq('id', selectedBooking.id)
      .select('*')
      .single();
    if (error) {
      setImportMessage(`Notes save failed: ${error.message}`);
      return;
    }
    const updated = mapDbBookingToUi(data);
    setBookings((prev) => prev.map((booking) => (booking.id === updated.id ? updated : booking)));
    setSelectedBooking(updated);
    appendHistory(updated.id, 'notes', 'Notes/alert updated');
    setImportMessage('Notes saved.');
  };

  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportMessage('');
    setIsImporting(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const rows = parseCsvText(await file.text());
      if (rows.length === 0) {
        setImportMessage('No data rows found in CSV.');
        return;
      }
      const payload = rows.map(mapCsvRowToDbBooking);
      const withBookingNumber = payload.filter((booking) => booking.booking_number);
      const withoutBookingNumber = payload.filter((booking) => !booking.booking_number);
      const importedRows = [];
      if (withBookingNumber.length > 0) {
        const { data, error } = await supabase.from('bookings').upsert(withBookingNumber, { onConflict: 'booking_number' }).select('*');
        if (error) {
          setImportMessage(`Import failed: ${error.message}`);
          return;
        }
        importedRows.push(...(data || []));
      }
      if (withoutBookingNumber.length > 0) {
        const { data, error } = await supabase.from('bookings').insert(withoutBookingNumber).select('*');
        if (error) {
          setImportMessage(`Import failed: ${error.message}`);
          return;
        }
        importedRows.push(...(data || []));
      }
      if (currentPage !== 1) setCurrentPage(1);
      await fetchBookings(1, search, filterStatus, filterDate);
      setImportMessage(`${importedRows.length} bookings imported successfully.`);
    } catch (error) {
      console.error('Import bookings error:', error);
      setImportMessage('Import failed due to unexpected error.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const exportCSV = () => {
    const headers = ['Booking number', 'Start', 'End', 'First name', 'Last name', 'Email address', 'Phone', 'Participants', 'Adults', 'Tour', 'Product code', 'Status', 'Source', 'Total gross', 'Total paid', 'Total due', 'Alert'];
    const rows = filtered.map((b) => [b.bookingNumber, b.startAt || '', b.endAt || '', b.name.split(' ').slice(0, -1).join(' '), b.name.split(' ').slice(-1).join(' '), b.email, b.phone, b.participants, b.adults, b.tour, b.productCode, b.status, b.source, b.totalGross, b.totalPaid, b.totalDue, b.alert]);
    const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
  };

  const todayBookings = overviewStats.today;
  const confirmedBookings = overviewStats.confirmed;
  const cancelledBookings = overviewStats.cancelled;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bookings</h1>
          <p className={styles.pageSub}>{loading ? 'Loading bookings...' : `${totalCount} records found`}</p>
        </div>
        <div className={styles.actionGroup}>
          <button className={styles.exportBtn} onClick={openCreateModal}>
            <i className="bi bi-plus-lg"></i> New Booking
          </button>
        <button className={styles.exportBtn} onClick={exportCSV}>
          <i className="bi bi-download"></i> Export CSV
        </button>
          <button className={styles.exportBtn} onClick={deleteSelectedBookings} disabled={selectedIds.length === 0}>
            <i className="bi bi-trash3-fill"></i> Delete Selected ({selectedIds.length})
          </button>
        </div>
          </div>

      <div className={styles.importPanel}>
          <div>
          <h3 className={styles.importTitle}>Import Bookings CSV</h3>
          <p className={styles.importSub}>Upload bookings CSV and sync data into Supabase.</p>
        </div>
        <label className={styles.importInputWrap}>
          <input type="file" accept=".csv,text/csv,text/plain" className={styles.importInput} onChange={handleImportCsv} disabled={isImporting} />
          <span className={styles.importBtn}>{isImporting ? 'Importing...' : 'Choose CSV File'}</span>
        </label>
          </div>
      {importMessage && <p className={styles.importMessage}>{importMessage}</p>}

      <div className={styles.statsRow}>
        <div className={styles.statCard}><i className="bi bi-calendar-day-fill" style={{ color: '#d4a84b' }}></i><div><span className={styles.statNum}>{todayBookings}</span><span className={styles.statLabel}>Today</span></div></div>
        <div className={styles.statCard}><i className="bi bi-check-circle-fill" style={{ color: '#1e88e5' }}></i><div><span className={styles.statNum}>{confirmedBookings}</span><span className={styles.statLabel}>Confirmed</span></div></div>
        <div className={styles.statCard}><i className="bi bi-x-circle-fill" style={{ color: '#f44336' }}></i><div><span className={styles.statNum}>{cancelledBookings}</span><span className={styles.statLabel}>Cancelled</span></div></div>
        <div className={styles.statCard}><i className="bi bi-collection-fill" style={{ color: '#4caf50' }}></i><div><span className={styles.statNum}>{overviewStats.total}</span><span className={styles.statLabel}>Total</span></div></div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search booking #, customer, phone, email, tour..."
            value={search}
            onChange={async (e) => {
              const next = e.target.value;
              setSearch(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchBookings(1, next, filterRoom, filterStatus, filterDate);
            }}
            className={styles.searchInput}
          />
          {search && (
            <button
              className={styles.clearBtn}
              onClick={async () => {
                setSearch('');
                if (currentPage !== 1) setCurrentPage(1);
                else await fetchBookings(1, '', filterRoom, filterStatus, filterDate);
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        <div className={styles.filters}>
          <select
            value={filterRoom}
            onChange={async (e) => {
              const next = e.target.value;
              setFilterRoom(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchBookings(1, search, next, filterStatus, filterDate);
            }}
            className={styles.select}
          >
            <option value="all">All Tours</option>
            {roomOptions.map((room) => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={async (e) => {
              const next = e.target.value;
              setFilterStatus(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchBookings(1, search, filterRoom, next, filterDate);
            }}
            className={styles.select}
          >
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="checked_in">Checked In</option>
            <option value="no_show">No Show</option>
            <option value="canceled">Canceled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={async (e) => {
              const next = e.target.value;
              setFilterDate(next);
              if (currentPage !== 1) setCurrentPage(1);
              else await fetchBookings(1, search, filterRoom, filterStatus, next);
            }}
            className={styles.select}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((booking) => selectedIds.includes(booking.id))}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(filtered.map((booking) => booking.id));
                    else setSelectedIds([]);
                  }}
                />
              </th>
              <th>Booking #</th>
              <th>Customer</th>
              <th>Tour/Product</th>
              <th>Date & Time</th>
              <th>Participants</th>
              <th>Payment</th>
              <th>Source</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className={styles.noResults}>No bookings found</td></tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className={styles.tableRow}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(b.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds((prev) => [...prev, b.id]);
                        else setSelectedIds((prev) => prev.filter((id) => id !== b.id));
                      }}
                    />
                  </td>
                  <td><span className={styles.muted}>{b.bookingNumber}</span></td>
                  <td><div className={styles.customerCell}><div className={styles.avatar}>{b.name.charAt(0)}</div><div><div className={styles.name}>{b.name}</div><div className={styles.muted}>{b.phone}</div></div></div></td>
                  <td><div className={styles.dateCell}><span>{b.tour}</span><span className={styles.muted}>{b.productCode}</span></div></td>
                  <td><div className={styles.dateCell}><span>{b.startAt ? new Date(b.startAt).toLocaleDateString() : '—'}</span><span className={styles.muted}>{b.startAt ? new Date(b.startAt).toLocaleTimeString() : '—'}</span></div></td>
                  <td><span className={styles.players}><i className="bi bi-people-fill"></i> {b.participants} ({b.adults} adults)</span></td>
                  <td><div className={styles.dateCell}><span>Gross: {b.totalGross}</span><span className={styles.muted}>Paid: {b.totalPaid} / Due: {b.totalDue}</span></div></td>
                  <td><span className={styles.sourceBadge}>{b.source}</span></td>
                  <td><span className={styles.statusBadge} style={{ background: (statusColors[b.status] || statusColors.booked).bg, color: (statusColors[b.status] || statusColors.booked).color }}>{b.status.toUpperCase()}</span></td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button className={styles.actionBtn} onClick={() => setSelectedBooking(b)}><i className="bi bi-eye-fill"></i></button>
                      <button className={styles.actionBtn} onClick={() => printBooking(b)} title="Print booking"><i className="bi bi-printer-fill"></i></button>
                      <button className={styles.actionBtn} onClick={() => openEditModal(b)} title="Edit booking"><i className="bi bi-pencil-fill"></i></button>
                      <button className={`${styles.actionBtn} ${styles.deleteActionBtn}`} onClick={() => deleteBooking(b.id)} title="Delete booking"><i className="bi bi-trash3-fill"></i></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
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

      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Booking Details</h3>
              <div className={styles.actionGroup}>
                <button className={styles.actionBtn} onClick={() => printBooking(selectedBooking)} title="Print"><i className="bi bi-printer-fill"></i></button>
                <button className={styles.actionBtn} onClick={() => openCustomerTab(selectedBooking)} title="Customer"><i className="bi bi-person-vcard-fill"></i></button>
                <button className={styles.closeBtn} onClick={() => setSelectedBooking(null)}><i className="bi bi-x-lg"></i></button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.tabRow}>
                {['booking', 'customer', 'notes', 'history'].map((tab) => (
                  <button key={tab} className={`${styles.tabBtn} ${detailTab === tab ? styles.tabActive : ''}`} onClick={() => setDetailTab(tab)}>
                    {tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {detailTab === 'booking' && (
              <div className={styles.modalGrid}>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Booking Number</span><span>{selectedBooking.bookingNumber}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Name</span><span>{selectedBooking.name}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Phone</span><span>{selectedBooking.phone}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Email</span><span>{selectedBooking.email}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Tour</span><span>{selectedBooking.tour}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Product Code</span><span>{selectedBooking.productCode}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Start</span><span>{selectedBooking.startAt ? new Date(selectedBooking.startAt).toLocaleString() : '—'}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>End</span><span>{selectedBooking.endAt ? new Date(selectedBooking.endAt).toLocaleString() : '—'}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Participants</span><span>{selectedBooking.participants} ({selectedBooking.adults} adults)</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Participants Details</span><span>{selectedBooking.participantsDetails}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Participants Names</span><span>{selectedBooking.participantsNames}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Payment</span><span>Gross {selectedBooking.totalGross} / Paid {selectedBooking.totalPaid} / Due {selectedBooking.totalDue}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Financials</span><span>Net {selectedBooking.totalNet} / VAT {selectedBooking.vat}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Prepaid</span><span>Credits {selectedBooking.prepaidCredits} / {selectedBooking.prepaidPackage}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Private Event / Missing Waivers</span><span>{selectedBooking.privateEvent ? 'Yes' : 'No'} / {selectedBooking.missingWaivers}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Customer Address</span><span>{selectedBooking.customerAddress}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Source</span><span>{selectedBooking.source}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Created By</span><span>{selectedBooking.createdBy}</span></div>
                <div className={styles.modalItem}><span className={styles.modalLabel}>Last Changed By</span><span>{selectedBooking.lastChangedBy}</span></div>
                </div>
              )}

              {detailTab === 'customer' && (
                <div className={styles.modalGrid}>
                <div className={styles.modalItem}>
                    <span className={styles.modalLabel}>Customer (from booking)</span>
                    <span>{selectedBooking?.name || '—'}</span>
                </div>
                <div className={styles.modalItem}>
                  <span className={styles.modalLabel}>Email</span>
                    <span>{selectedBooking?.email || '—'}</span>
                  </div>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Telephone Home</span><input className={styles.editInput} value={customerDraft?.customer_telephone_home || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_telephone_home: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Telephone Work</span><input className={styles.editInput} value={customerDraft?.customer_telephone_work || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_telephone_work: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Telephone Mobile</span><input className={styles.editInput} value={customerDraft?.customer_telephone_mobile || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_telephone_mobile: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Address</span><input className={styles.editInput} value={customerDraft?.customer_address_1 || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_address_1: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Gender</span><input className={styles.editInput} value={customerDraft?.customer_gender || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_gender: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Total bookings</span><input type="number" className={styles.editInput} value={customerDraft?.customer_total_bookings || 0} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_total_bookings: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Cancellations</span><input type="number" className={styles.editInput} value={customerDraft?.customer_cancellations || 0} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_cancellations: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>No-shows</span><input type="number" className={styles.editInput} value={customerDraft?.customer_no_shows || 0} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_no_shows: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Credit</span><input type="number" step="0.01" className={styles.editInput} value={customerDraft?.customer_credit || 0} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_credit: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Membership</span><input className={styles.editInput} value={customerDraft?.customer_membership_enrolled || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_membership_enrolled: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Member Until</span><input type="date" className={styles.editInput} value={customerDraft?.customer_member_until || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_member_until: e.target.value }))} /></label>
                  <label className={styles.modalItem}><span className={styles.modalLabel}>Membership Rate</span><input className={styles.editInput} value={customerDraft?.customer_membership_rate || ''} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_membership_rate: e.target.value }))} /></label>
                  <label className={styles.modalItem}>
                    <span className={styles.modalLabel}>Require Approval</span>
                    <select className={styles.editInput} value={customerDraft?.customer_require_approval ? 'yes' : 'no'} onChange={(e) => setCustomerDraft((p) => ({ ...p, customer_require_approval: e.target.value === 'yes' }))}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                  <div className={styles.modalActions}>
                    <button className={styles.exportBtn} onClick={saveCustomerDraft}>Save Customer</button>
                  </div>
                  {linkedCustomer && (
                    <div className={styles.modalSection}>
                      <span className={styles.modalLabel}>Matched Customer Profile</span>
                      <span className={styles.muted}>
                        {linkedCustomer.full_name || `${linkedCustomer.first_name || ''} ${linkedCustomer.last_name || ''}`.trim() || '—'} | Credit: {linkedCustomer.credit ?? 0} | Membership: {linkedCustomer.membership_enrolled || '—'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'notes' && (
                <div className={styles.modalSection}>
                  <label className={styles.modalItem}>
                    <span className={styles.modalLabel}>Notes / Alert</span>
                    <textarea className={styles.editTextarea} value={selectedBooking.alert || ''} onChange={(e) => setSelectedBooking((prev) => ({ ...prev, alert: e.target.value }))} />
                  </label>
                  <div className={styles.modalActions}>
                    <button className={styles.exportBtn} onClick={saveNotes}>Save Notes</button>
                  </div>
                </div>
              )}

              {detailTab === 'history' && (
                <div className={styles.modalSection}>
                <div className={styles.modalItem}>
                    <span className={styles.modalLabel}>Current Booking</span>
                    <span>
                      #{selectedBooking.bookingNumber} | {selectedBooking.tour} | {selectedBooking.startAt ? new Date(selectedBooking.startAt).toLocaleString() : '—'} | {selectedBooking.status}
                    </span>
                </div>
                <div className={styles.modalItem}>
                    <span className={styles.modalLabel}>Previous Bookings (Same Customer)</span>
                    {relatedBookings.length === 0 ? (
                      <span className={styles.muted}>No previous bookings found for this customer.</span>
                    ) : (
                      relatedBookings.map((booking) => (
                        <span key={booking.id} className={styles.muted}>
                          #{booking.booking_number || '—'} | {booking.tour || '—'} | {booking.start_at ? new Date(booking.start_at).toLocaleString() : '—'} | {booking.status || '—'} | Gross {booking.total_gross ?? 0}, Paid {booking.total_paid ?? 0}, Due {booking.total_due ?? 0}
                        </span>
                      ))
                    )}
                </div>
                  {readHistory(selectedBooking.id).map((item, index) => (
                    <div key={`${item.at}-${index}`} className={styles.modalItem}>
                      <span className={styles.modalLabel}>{new Date(item.at).toLocaleString()} — {item.action}</span>
                      <span>{item.message}</span>
                </div>
                  ))}
                  {readHistory(selectedBooking.id).length === 0 && <span className={styles.muted}>No history entries yet.</span>}
                </div>
              )}

              {detailTab === 'booking' && (
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Update Status</span>
                <div className={styles.statusBtns}>
                  {['booked', 'checked_in', 'no_show', 'canceled'].map((s) => (
                    <button
                      key={s}
                      className={`${styles.statusUpdateBtn} ${selectedBooking.status === s ? styles.statusUpdateActive : ''}`}
                      style={selectedBooking.status === s ? { background: (statusColors[s] || statusColors.booked).bg, color: (statusColors[s] || statusColors.booked).color, borderColor: (statusColors[s] || statusColors.booked).color } : {}}
                      onClick={() => updateStatus(selectedBooking.id, s)}
                    >
                      {s.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
              )}
              {selectedBooking.alert && <div className={styles.modalSection}><span className={styles.modalLabel}>Alert</span><span className={styles.muted}>{selectedBooking.alert}</span></div>}
            </div>
          </div>
        </div>
      )}

      {editingBooking && (
        <div className={styles.modalOverlay} onClick={() => setEditingBooking(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Booking</h3>
              <button className={styles.closeBtn} onClick={() => setEditingBooking(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Booking Number</span><input className={styles.editInput} value={editingBooking.booking_number} onChange={(e) => handleEditChange('booking_number', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>First Name</span><input className={styles.editInput} value={editingBooking.first_name} onChange={(e) => handleEditChange('first_name', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Last Name</span><input className={styles.editInput} value={editingBooking.last_name} onChange={(e) => handleEditChange('last_name', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Email</span><input className={styles.editInput} value={editingBooking.email_address} onChange={(e) => handleEditChange('email_address', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Phone</span><input className={styles.editInput} value={editingBooking.phone} onChange={(e) => handleEditChange('phone', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Tour</span><input className={styles.editInput} value={editingBooking.tour} onChange={(e) => handleEditChange('tour', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Product Code</span><input className={styles.editInput} value={editingBooking.product_code} onChange={(e) => handleEditChange('product_code', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Participants</span><input type="number" className={styles.editInput} value={editingBooking.participants} onChange={(e) => handleEditChange('participants', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Adults</span><input type="number" className={styles.editInput} value={editingBooking.adults} onChange={(e) => handleEditChange('adults', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Status</span><select className={styles.editInput} value={editingBooking.status} onChange={(e) => handleEditChange('status', e.target.value)}><option value="booked">booked</option><option value="checked_in">checked_in</option><option value="no_show">no_show</option><option value="canceled">canceled</option></select></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Source</span><input className={styles.editInput} value={editingBooking.source} onChange={(e) => handleEditChange('source', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Total Gross</span><input type="number" step="0.01" className={styles.editInput} value={editingBooking.total_gross} onChange={(e) => handleEditChange('total_gross', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Total Paid</span><input type="number" step="0.01" className={styles.editInput} value={editingBooking.total_paid} onChange={(e) => handleEditChange('total_paid', e.target.value)} /></label>
                <label className={styles.modalItem}><span className={styles.modalLabel}>Total Due</span><input type="number" step="0.01" className={styles.editInput} value={editingBooking.total_due} onChange={(e) => handleEditChange('total_due', e.target.value)} /></label>
              </div>
              <label className={styles.modalItem}><span className={styles.modalLabel}>Alert</span><textarea className={styles.editTextarea} value={editingBooking.alert} onChange={(e) => handleEditChange('alert', e.target.value)} /></label>
              <div className={styles.modalActions}>
                <button className={styles.secondaryBtn} onClick={() => setEditingBooking(null)}>Cancel</button>
                <button className={styles.exportBtn} onClick={saveBooking}>{isCreatingBooking ? 'Create Booking' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}