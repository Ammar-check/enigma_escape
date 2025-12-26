'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './EventCard.module.css';

const cardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function EventCard({ event }) {
  const { t, isArabic } = useLanguage();

  return (
    <motion.div
      className={styles.eventCard}
      variants={cardVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className={styles.eventImageWrapper}>
        <img
          src={event.image}
          alt={isArabic ? event.titleAr : event.titleEn}
          className={styles.eventImage}
        />
        <div className={styles.eventOverlay}>
          <Link href="/contact" className="btn btn-gold">
            {t('bookNow')}
          </Link>
        </div>
      </div>
      <div className={styles.eventContent}>
        <h3 className={styles.eventTitle}>
          {isArabic ? event.titleAr : event.titleEn}
        </h3>
        <p className={styles.eventDescription}>
          {isArabic ? event.descriptionAr : event.descriptionEn}
        </p>
      </div>
    </motion.div>
  );
}

