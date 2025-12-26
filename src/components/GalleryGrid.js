'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
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

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
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
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className={styles.galleryItem}
            variants={imageVariants}
            whileHover={{ 
              scale: 1.05, 
              zIndex: 10,
              boxShadow: '0 20px 40px rgba(212, 168, 75, 0.3)'
            }}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.src}
              alt={isArabic ? image.titleAr : image.titleEn}
              className={styles.galleryImage}
            />
            <motion.div 
              className={styles.imageOverlay}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <h3 className={styles.imageTitle}>
                {isArabic ? image.titleAr : image.titleEn}
              </h3>
              <i className="bi bi-zoom-in"></i>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className={styles.closeBtn}
                onClick={() => setSelectedImage(null)}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="bi bi-x-lg"></i>
              </motion.button>
              <img
                src={selectedImage.src}
                alt={isArabic ? selectedImage.titleAr : selectedImage.titleEn}
                className={styles.lightboxImage}
              />
              <h3 className={styles.lightboxTitle}>
                {isArabic ? selectedImage.titleAr : selectedImage.titleEn}
              </h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

