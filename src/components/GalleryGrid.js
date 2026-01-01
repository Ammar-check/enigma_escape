'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import styles from './GalleryGrid.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function GalleryGrid({ images }) {
  const { isArabic } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <motion.div
        className={styles.galleryGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {images.map((item) => (
          <motion.div
            key={item.id}
            className={styles.galleryItem}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            onClick={() => setSelectedImage(item)}
          >
            <Image
              src={item.src}
              alt={isArabic ? item.titleAr : item.titleEn}
              className={styles.galleryImage}
              width={400}
              height={300}
            />
            <div className={styles.itemOverlay}>
              <span className={styles.itemTitle}>
                {isArabic ? item.titleAr : item.titleEn}
              </span>
              <i className="bi bi-arrows-fullscreen"></i>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <Image
              src={selectedImage.src}
              alt={isArabic ? selectedImage.titleAr : selectedImage.titleEn}
              className={styles.lightboxImage}
              width={1200}
              height={800}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

