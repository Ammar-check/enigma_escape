'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      try {
        const response = await fetch('/api/contact', { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load contact messages.');
        }

        if (mounted) {
          setMessages(result.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load contact messages.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMessages();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Contact Messages</h1>
        <p className={styles.pageSub}>Messages submitted from website forms</p>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.stateText}>Loading messages...</div>
        ) : error ? (
          <div className={styles.errorText}>{error}</div>
        ) : messages.length === 0 ? (
          <div className={styles.stateText}>No messages found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((item) => (
                <tr key={item.id}>
                  <td>{item.full_name}</td>
                  <td>{item.phone}</td>
                  <td>{item.email}</td>
                  <td className={styles.messageCell}>{item.message}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
