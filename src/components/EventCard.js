'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './EventCard.module.css';

const cardVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function EventCard({ event }) {
  const { t, isArabic } = useLanguage();

  return (
    <motion.div
      className={styles.eventCard}
      variants={cardVariants}
    >
      <div className={styles.eventImageWrapper}>
        <img
          src={event.image}
          alt={isArabic ? event.titleAr : event.titleEn}
          className={styles.eventImage}
        />
        <div className={styles.eventOverlay}>
          <h3 className={styles.eventTitle}>
            {isArabic ? event.titleAr : event.titleEn}
          </h3>
        </div>
        <div className={styles.eventBookBtn}>
          <a 
            href="https://bookeo.com/enigmaescapesa" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-gold"
          >
            {t('bookNow')}
          </a>
        </div>
      </div>
    </motion.div>
  );
}

