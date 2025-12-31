'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import EventCard from '@/components/EventCard';
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

export default function EventsPage() {
  const { t, isArabic } = useLanguage();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const benefits = [
    {
      icon: 'bi-people-fill',
      titleEn: 'Group Packages',
      titleAr: 'باقات جماعية',
      textEn: 'Special rates for large groups',
      textAr: 'أسعار خاصة للمجموعات الكبيرة',
    },
    {
      icon: 'bi-calendar-check',
      titleEn: 'Flexible Booking',
      titleAr: 'حجز مرن',
      textEn: 'Available 7 days a week',
      textAr: 'متاح 7 أيام في الأسبوع',
    },
    {
      icon: 'bi-trophy',
      titleEn: 'Unique Experience',
      titleAr: 'تجربة فريدة',
      textEn: 'Memorable moments guaranteed',
      textAr: 'لحظات لا تُنسى مضمونة',
    },
    {
      icon: 'bi-headset',
      titleEn: 'Dedicated Support',
      titleAr: 'دعم مخصص',
      textEn: 'Professional event coordination',
      textAr: 'تنسيق احترافي للفعاليات',
    },
  ];

  return (
    <div className={styles.pageWrapper} ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroBanner}>
        <motion.div className={styles.parallaxBg} style={{ y }}></motion.div>
        <div className={styles.heroOverlay}></div>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.heroTitle}>{t('privateEvents')}</h1>
          <p className={styles.heroSubtitle}>
            {isArabic ? 'اجعل فعاليتك استثنائية' : 'Make your event extraordinary'}
          </p>
        </motion.div>
      </section>

      {/* Events Section */}
      <section className={`section-padding ${styles.eventsSection}`}>
        <div className="container">
          <motion.div
            className={styles.eventsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {siteData.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`section-padding ${styles.benefitsSection}`}>
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {isArabic ? 'لماذا تختارنا؟' : 'WHY CHOOSE US?'}
          </motion.h2>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className={styles.benefitCard}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className={styles.benefitIcon}>
                  <i className={`bi ${benefit.icon}`}></i>
                </div>
                <h4>{isArabic ? benefit.titleAr : benefit.titleEn}</h4>
                <p>{isArabic ? benefit.textAr : benefit.textEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

