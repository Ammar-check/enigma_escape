'use client';

import styles from './offers.module.css';
import { motion } from 'framer-motion';

export default function OffersPage() {
  return (
    <section className={styles.offersPage}>
      <div className="container">
         <div className={styles.overlay}></div>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          OFFERS & PROMOTIONS
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Join our Instagram community for exclusive offers and epic escape deals!
        </motion.p>

        <motion.a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.instaBtn}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          Follow on Instagram
        </motion.a>

      </div>
    </section>
  );
}