'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import FAQItem from '@/components/FAQItem';
import siteData from '@/data/siteData.json';
import styles from './page.module.css';

export default function FAQPage() {
  const { t, isArabic } = useLanguage();
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

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
          <h1 className={styles.heroTitle}>{t('faqs')}</h1>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className={`section-padding ${styles.faqSection}`}>
        <div className="container">
          <motion.div
            className={styles.faqGrid}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {siteData.faqs.map((faq, index) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => toggleFAQ(faq.id)}
              />
            ))}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className={styles.contactCta}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3>
              {isArabic ? 'لا زلت لديك أسئلة؟' : 'Still have questions?'}
            </h3>
            <p>
              {isArabic ? 'لا تتردد في التواصل معنا!' : 'Feel free to reach out to us!'}
            </p>
            <Link href="/contact" className="btn btn-gold mt-3">
              {t('contactUs')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
