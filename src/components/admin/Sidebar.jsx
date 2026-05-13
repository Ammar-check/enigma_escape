'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'bi-speedometer2' },
  { href: '/admin/customers', label: 'Customers', icon: 'bi-people-fill' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'bi-calendar-check' },
  { href: '/admin/calendar', label: 'Calendar', icon: 'bi-calendar3' },
  { href: '/admin/manage-rooms', label: 'Manage Rooms', icon: 'bi-door-open-fill' },
  { href: '/admin/waivers', label: 'Waivers', icon: 'bi-file-earmark-text' },
  { href: '/admin/game-results', label: 'Game Results', icon: 'bi-trophy-fill' },
  { href: '/admin/contact-messages', label: 'Contact Messages', icon: 'bi-envelope-paper-fill' },
  { href: '/admin/videos', label: 'Video Queue', icon: 'bi-camera-video-fill' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'bi-bar-chart-fill' },
];

export default function Sidebar({ collapsed = false, onToggleCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 992px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  const closeMobile = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${
          collapsed && !isMobile ? styles.collapsed : ''
        }`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoCompact} aria-hidden="true">
              E
            </span>
            <span className={styles.logoWord}>ENIGMA</span>
            <span className={styles.adminBadge}>ADMIN</span>
          </div>

          {!isMobile && (
            <button
              type="button"
              className={styles.collapseToggle}
              onClick={() => onToggleCollapsed?.()}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <i
                className={`bi ${collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}
              />
            </button>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.sidebarLink} ${
                pathname === item.href ? styles.active : ''
              }`}
              title={item.label}
              onClick={closeMobile}
            >
              <i className={`bi ${item.icon}`} aria-hidden="true" />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link
            href="/"
            className={styles.sidebarLink}
            title="View website"
            onClick={closeMobile}
          >
            <i className="bi bi-globe" aria-hidden="true" />
            <span className={styles.navLabel}>View Website</span>
          </Link>
          <button
            type="button"
            className={styles.sidebarLink}
            onClick={handleLogout}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            <span className={styles.navLabel}>Logout</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? (
          <i className="bi bi-x-lg" aria-hidden="true" />
        ) : (
          <i className="bi bi-list" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
