'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './VrDetailClient.module.css';
import Link from 'next/link';
import Image from 'next/image';


export default function VrDetailClient({ room }) {
  const { t, isArabic } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log(room);

  if (!room) {
    return (
      <div className={styles.notFound}>
        <h1>Room Not Found</h1>
        <Link href="/" className="btn btn-gold">Back to Home</Link>
      </div>
    );
  }

  // Encode image URL to handle spaces in filenames
  const encodedImage = encodeURI(room.image);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={styles.hero} style={{ '--room-color': room.color }}>
        <div className={styles.heroBg} style={{ backgroundImage: `url(${encodedImage})` }}></div>
        <div className={styles.heroOverlay}></div>
      </div>
    );
  }

  const genreLabels = {
    horror: { en: 'Horror', ar: 'رعب' },
    adventure: { en: 'Adventure', ar: 'مغامرة' },
    mystery: { en: 'Mystery', ar: 'غموض' },
  };


   const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const titleVariants = {
  hidden: { 
    opacity: 0, 
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const comingSoonVariants = {
  hidden: { 
    opacity: 0, 
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

  return (
    <>
      {/* Hero Section with Room Image */}
      <section 
        className={styles.hero}
        style={{ '--room-color': room.color }}
      >
      </section>


    </>
  );
}

