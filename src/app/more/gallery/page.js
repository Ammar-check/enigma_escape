'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import GalleryGrid from '@/components/GalleryGrid';
import siteData from '@/data/siteData.json';
import styles from './page.module.css';

export default function GalleryPage() {
  const { t } = useLanguage();

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
          <h1 className={styles.heroTitle}>{t('gallery')}</h1>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className={`section-padding ${styles.gallerySection}`}>
        <div className="container">
          <GalleryGrid images={siteData.gallery} />
        </div>
      </section>
    </div>
  );
}
