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

      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.ctaTitle}>
              {isArabic
                ? 'هل أنت مستعد لإنشاء قصتك الخاصة؟'
                : 'Ready to Create Your Own Story?'}
            </h2>
            <p className={styles.ctaText}>
              {isArabic
                ? 'احجز تجربة غرفة الهروب الخاصة بك اليوم!'
                : 'Book your escape room experience today!'}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a 
                href="https://bookeo.com/enigmaescapesa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-gold mt-4"
              >
                {t('bookNow')}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
