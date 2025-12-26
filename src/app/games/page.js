'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import RoomCard from '@/components/RoomCard';
import siteData from '@/data/siteData.json';
import styles from './page.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function GamesPage() {
  const { t, isArabic } = useLanguage();

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.heroOverlay}></div>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.heroTitle}>{t('ourRooms')}</h1>
          <p className={styles.heroSubtitle}>
            {isArabic
              ? 'اختر مغامرتك واهرب في 60 دقيقة'
              : 'Choose your adventure and escape in 60 minutes'}
          </p>
        </motion.div>
      </section>

      {/* Rooms Grid */}
      <section className={`section-padding ${styles.roomsSection}`}>
        <div className="container">
          <motion.div
            className={styles.roomsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {siteData.rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}

            {/* Coming Soon Card */}
            <motion.div
              className={styles.comingSoon}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={styles.comingSoonContent}>
                <motion.h3
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {t('comingSoon')}
                </motion.h3>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
