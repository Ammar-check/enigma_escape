'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import RoomCard from '@/components/RoomCard';
import siteData from '@/data/siteData.json';
import styles from './page.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function Home() {
  const { t, isArabic } = useLanguage();
  const heroRef = useRef(null);
  const contactRef = useRef(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const { scrollYProgress: contactProgress } = useScroll({
    target: contactRef,
    offset: ['start end', 'end start'],
  });

  const heroY = useTransform(heroProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);
  const contactBgY = useTransform(contactProgress, [0, 1], [0, -100]);

  const { contactInfo } = siteData;

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div className={styles.heroBg} style={{ y: heroY }}></motion.div>
        <div className={styles.heroOverlay}></div>

        <motion.div
          className={styles.heroContent}
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className={styles.heroNumber}>60</span>
            <span className={styles.heroMinutes}>{t('minutes')}</span>
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {t('heroSubtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.heroGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        ></motion.div>

        {/* Scroll indicator */}
        <motion.div
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <i className="bi bi-chevron-double-down"></i>
        </motion.div>

        {/* Circuit Divider at bottom of hero */}
        <div className={styles.heroCircuitDivider}>
          <div className={styles.circuitLine}></div>
          <div className={styles.circuitDot}></div>
        </div>
      </section>

      {/* Our Rooms Section */}
      <section className={`section-padding ${styles.roomsSection}`}>
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('ourRooms')}
          </motion.h2>

          <motion.div
            className={styles.roomsList}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {siteData.rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}

            {/* Coming Soon Card */}
            <motion.div
              className={`${styles.roomCard} ${styles.comingSoon}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={styles.comingSoonContent}>
                <motion.h3
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {t('comingSoon')}
                </motion.h3>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className={`section-padding ${styles.contactSection}`}
        ref={contactRef}
      >
        <motion.div
          className={styles.contactBg}
          style={{ y: contactBgY }}
        ></motion.div>
        <div className={styles.contactOverlay}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('contactUs')}
          </motion.h2>

          <div className="row">
            {/* Contact Info */}
            <div className="col-lg-5 mb-5 mb-lg-0">
              <motion.div
                className={styles.contactInfo}
                initial={{ opacity: 0, x: isArabic ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h4 className={styles.contactTitle}>
                  {isArabic ? contactInfo.companyNameAr : contactInfo.companyNameEn}
                </h4>

                <motion.div
                  className={styles.contactItem}
                  whileHover={{ x: isArabic ? -10 : 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <i className="bi bi-clock"></i>
                  <div>
                    <h5>{t('hoursOfOperation')}</h5>
                    <p>{isArabic ? contactInfo.hours.sunWedAr : contactInfo.hours.sunWedEn}</p>
                    <p>{isArabic ? contactInfo.hours.thursdayAr : contactInfo.hours.thursdayEn}</p>
                    <p>{isArabic ? contactInfo.hours.fridayAr : contactInfo.hours.fridayEn}</p>
                  </div>
                </motion.div>

                <motion.div
                  className={styles.contactItem}
                  whileHover={{ x: isArabic ? -10 : 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <i className="bi bi-geo-alt-fill"></i>
                  <div>
                    <h5>{t('shorafatPark')}</h5>
                    <p>{isArabic ? contactInfo.addressAr : contactInfo.addressEn}</p>
                  </div>
                </motion.div>

                <motion.div
                  className={styles.contactItem}
                  whileHover={{ x: isArabic ? -10 : 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <h5>{t('phone')}</h5>
                    <p>{contactInfo.phone}</p>
                  </div>
                </motion.div>

                <motion.div
                  className={styles.contactItem}
                  whileHover={{ x: isArabic ? -10 : 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <h5>{t('email')}</h5>
                    <p>{contactInfo.email}</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-7">
              <motion.form
                className={`form-dark ${styles.contactForm}`}
                initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('fullName')}
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder={t('phoneInput')}
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="email"
                    className="form-control"
                    placeholder={t('emailAddress')}
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder={t('message')}
                    required
                  ></textarea>
                </div>
                <div className={isArabic ? 'text-start' : 'text-end'}>
                  <motion.button
                    type="submit"
                    className="btn btn-outline-gold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('sendMessage')}
                  </motion.button>
                </div>
              </motion.form>
            </div>
          </div>

          {/* Map */}
          <motion.div
            className={styles.mapWrapper}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <iframe
              src={contactInfo.mapUrl}
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </section>
    </>
  );
}
