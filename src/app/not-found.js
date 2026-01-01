'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page
    router.replace('/');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#d4a84b',
      textAlign: 'center',
      fontFamily: 'Orbitron, sans-serif'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Redirecting...</h1>
        <p>Taking you to the home page</p>
      </div>
    </div>
  );
}

