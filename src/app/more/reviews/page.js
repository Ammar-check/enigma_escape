'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import ReviewCard from '@/components/ReviewCard';
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

export default function ReviewsPage() {
  const { t, isArabic } = useLanguage();

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroBanner}>
        <div className={styles.heroOverlay}></div>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.heroTitle}>{t('reviews')}</h1>
        </motion.div>
      </section>

      {/* Reviews Section */}
      <section className={`section-padding ${styles.reviewsSection}`}>
        <div className="container">
          <motion.div
            className={styles.reviewsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {siteData.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
