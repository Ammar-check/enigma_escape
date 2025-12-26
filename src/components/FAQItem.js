'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './FAQItem.module.css';

export default function FAQItem({ faq, isOpen, onToggle }) {
  const { isArabic } = useLanguage();

  return (
    <motion.div
      className={`${styles.faqItem} ${isOpen ? styles.active : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <button className={styles.faqQuestion} onClick={onToggle}>
        <span>{isArabic ? faq.questionAr : faq.questionEn}</span>
        <motion.i
          className="bi bi-chevron-down"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        ></motion.i>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.faqAnswer}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>{isArabic ? faq.answerAr : faq.answerEn}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

