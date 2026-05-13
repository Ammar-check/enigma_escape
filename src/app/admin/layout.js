'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './layout.module.css';
import Sidebar from '@/components/admin/Sidebar';

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    const isLoginPage = pathname === '/admin/login';

    if (!isAuth && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (pathname === '/admin/login') return;
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, [pathname]);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) return <>{children}</>;

  return (
    <div className={styles.adminWrapper}>
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={toggleSidebarCollapsed} />
      <main
        className={`${styles.adminMain} ${sidebarCollapsed ? styles.adminMainCollapsed : ''}`}
      >
        {children}
      </main>
    </div>
  );
}