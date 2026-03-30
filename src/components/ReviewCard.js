'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ReviewCard.module.css';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function ReviewCard({ review }) {
  const { isArabic } = useLanguage();

  return (
    <motion.div
      className={styles.reviewCard}
      variants={cardVariants}
      whileHover={{ y: -5 }}
    >
      <div className={styles.quoteIcon}>“</div>
      <div className={styles.reviewContent}>
        <p className={styles.reviewText}>
          {isArabic ? review.textAr : review.textEn}
        </p>
        <div className={styles.reviewAuthor}>
          <img
            src={review.image}
            alt={review.author}
            className={styles.authorImage}
          />
          <span className={styles.authorName}>{review.author}</span>
        </div>
      </div>
    </motion.div>
  );
}
