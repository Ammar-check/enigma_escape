'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ReviewCard.module.css';

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
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
      whileHover={{
        y: -10,
        boxShadow: '0 20px 40px rgba(212, 168, 75, 0.2)',
      }}
    >
      <div className={styles.quoteIcon}>&ldquo;</div>
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
    </motion.div>
  );
}

