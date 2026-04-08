'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useState } from 'react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'bi-speedometer2' },
  { href: '/admin/customers', label: 'Customers', icon: 'bi-people-fill' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'bi-calendar-check' },
  { href: '/admin/waivers', label: 'Waivers', icon: 'bi-file-earmark-text' },
  { href: '/admin/game-results', label: 'Game Results', icon: 'bi-trophy-fill' },
  { href: '/admin/videos', label: 'Video Queue', icon: 'bi-camera-video-fill' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'bi-bar-chart-fill' },
];

export default function Sidebar() {
   const [isOpen,setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
  localStorage.removeItem('admin_auth');
  router.push('/admin/login');
};

  return (
    <>
  {/* {// ================== mobile overlay=========} */}
    {isOpen && <div className={styles.overlay} onClick={()=>setIsOpen(false)} />}

    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.sidebarLogo}>
        <span>ENIGMA</span>
        <span className={styles.adminBadge}>ADMIN</span>
      </div>

      {/* Menu */}
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.sidebarLink} ${pathname === item.href ? styles.active : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className={styles.sidebarBottom}>
        <Link href="/" className={styles.sidebarLink}>
          <i className="bi bi-globe"></i>
          <span>View Website</span>
        </Link>
        <button className={styles.sidebarLink} onClick={handleLogout}>
  <i className="bi bi-box-arrow-right"></i>
  <span>Logout</span>
</button>
      </div>
    </aside>

    {/* Mobile Hamburger */}
      <button className={styles.mobileToggle} onClick={() => setIsOpen(true)}>
        <i className="bi bi-list"></i>
      </button>
    </>
  );
}