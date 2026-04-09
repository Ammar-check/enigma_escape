'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './layout.module.css';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    const isLoginPage = pathname === '/admin/login';

    if (!isAuth && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [pathname]);

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) return <>{children}</>;

  return (
    <div className={styles.adminWrapper}>
      <Sidebar />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}