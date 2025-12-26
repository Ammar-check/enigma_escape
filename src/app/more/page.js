'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function MorePage() {
  const { t, isArabic } = useLanguage();

  const moreLinks = [
    {
      id: 1,
      titleEn: 'REVIEWS',
      titleAr: 'التقييمات',
      descriptionEn: 'See what our guests are saying about their experience',
      descriptionAr: 'شاهد ما يقوله ضيوفنا عن تجربتهم',
      icon: 'bi-star-fill',
      href: '/more/reviews',
      color: '#FFD700',
    },
    {
      id: 2,
      titleEn: 'GALLERY',
      titleAr: 'المعرض',
      descriptionEn: 'Explore our immersive escape room environments',
      descriptionAr: 'استكشف بيئات غرف الهروب الغامرة لدينا',
      icon: 'bi-images',
      href: '/more/gallery',
      color: '#00f0ff',
    },
    {
      id: 3,
      titleEn: 'PRIVATE EVENTS',
      titleAr: 'المناسبات الخاصة',
      descriptionEn: 'Birthday parties, corporate events & more',
      descriptionAr: 'حفلات أعياد الميلاد، فعاليات الشركات والمزيد',
      icon: 'bi-calendar-event',
      href: '/more/events',
      color: '#ff6b6b',
    },
    {
      id: 4,
      titleEn: 'FAQS',
      titleAr: 'الأسئلة الشائعة',
      descriptionEn: 'Find answers to commonly asked questions',
      descriptionAr: 'اعثر على إجابات للأسئلة الشائعة',
      icon: 'bi-question-circle-fill',
      href: '/more/faq',
      color: '#4ecdc4',
    },
  ];

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
          <h1 className={styles.heroTitle}>
            {isArabic ? 'استكشف المزيد' : 'EXPLORE MORE'}
          </h1>
          <p className={styles.heroSubtitle}>
            {isArabic
              ? 'اكتشف كل ما تقدمه إنجما'
              : 'Discover everything Enigma has to offer'}
          </p>
        </motion.div>
      </section>

      {/* Links Grid */}
      <section className={`section-padding ${styles.linksSection}`}>
        <div className="container">
          <motion.div
            className={styles.linksGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {moreLinks.map((link) => (
              <motion.div
                key={link.id}
                variants={cardVariants}
                whileHover={{
                  y: -15,
                  boxShadow: `0 30px 60px rgba(0, 0, 0, 0.4), 0 0 30px ${link.color}33`,
                }}
              >
                <Link href={link.href} className={styles.linkCard}>
                  <motion.div
                    className={styles.iconWrapper}
                    style={{ '--accent-color': link.color }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <i className={`bi ${link.icon}`}></i>
                  </motion.div>
                  <h3 className={styles.linkTitle}>
                    {isArabic ? link.titleAr : link.titleEn}
                  </h3>
                  <p className={styles.linkDescription}>
                    {isArabic ? link.descriptionAr : link.descriptionEn}
                  </p>
                  <motion.span className={styles.arrowIcon} whileHover={{ x: 10 }}>
                    <i className={`bi ${isArabic ? 'bi-arrow-left' : 'bi-arrow-right'}`}></i>
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>{isArabic ? 'هل أنت مستعد للهروب؟' : 'Ready for Your Escape?'}</h2>
            <p>
              {isArabic
                ? 'احجز الآن واستمتع بـ 60 دقيقة لن تنساها!'
                : 'Book now and experience 60 minutes you will never forget!'}
            </p>
            <div className={styles.ctaButtons}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/contact" className="btn btn-gold">
                  {t('bookNow')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/games" className="btn btn-outline-gold">
                  {isArabic ? 'عرض الألعاب' : 'VIEW GAMES'}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
