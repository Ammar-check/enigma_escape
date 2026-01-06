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
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const titleVariants = {
  hidden: { 
    opacity: 0, 
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const comingSoonVariants = {
  hidden: { 
    opacity: 0, 
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
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

  const heroY = useTransform(heroProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);

  const { contactInfo, contactForm } = siteData;

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div className={styles.heroBg} style={{ y: heroY }}></motion.div>
        <div className={styles.heroOverlay}></div>

        <div className="container">
          <motion.div
            className={styles.heroContent}
            style={{ opacity: heroOpacity }}
            initial={{ opacity: 0, x: isArabic ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 100,
                damping: 10,
                delay: 0.5 
              }}
            >
              <motion.span 
                className={styles.heroNumber}
                animate={{ 
                  textShadow: [
                    '0 0 30px rgba(252, 196, 3, 0.5)',
                    '0 0 60px rgba(252, 196, 3, 0.8)',
                    '0 0 30px rgba(252, 196, 3, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                60
              </motion.span>
              <motion.span 
                className={styles.heroMinutes}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {t('minutes')}
              </motion.span>
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
        </div>

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

        {/* Circuit Divider - White color */}
        <div className={styles.heroCircuitDivider}>
          <div className={styles.circuitLine}></div>
          <div className={styles.circuitDot}></div>
        </div>
      </section>

      {/* Our Rooms Section */}
      <section id="games-section" className={`section-padding ${styles.roomsSection}`}>
        <div className="container">
         <motion.h2
  className="section-title"
  variants={titleVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  style={{ position: 'relative', zIndex: 2 }}
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
              variants={comingSoonVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className={styles.comingSoonContent}>
                <h3>
                  {t('comingSoon')}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section with White Divider Above - Home Page Only */}
      <section className={styles.contactSection} ref={contactRef}>
        {/* White Divider SVG - Full Width */}
        <motion.div 
          className={styles.whiteDivider}
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path d="M0 30 L100 30 L120 10 L300 10 L320 30 L500 30 L520 50 L700 50 L720 30 L900 30 L920 10 L1100 10 L1120 30 L1200 30" stroke="#ffffff" strokeWidth="2" fill="none"/>
          </svg>
        </motion.div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>

          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: 'spring',
              stiffness: 150,
              damping: 15,
            }}
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
                {contactForm.fields.map((field) => (
                  <div key={field.id} className="mb-4">
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.id}
                        name={field.name}
                        className="form-control"
                        rows={field.rows}
                        placeholder={isArabic ? field.placeholderAr : field.placeholderEn}
                        required={field.required}
                      ></textarea>
                    ) : (
                      <input
                        id={field.id}
                        name={field.name}
                        type={field.type}
                        className="form-control"
                        placeholder={isArabic ? field.placeholderAr : field.placeholderEn}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
                <div className={isArabic ? 'text-start' : 'text-end'}>
                  <motion.button
                    type="submit"
                    className="btn btn-outline-gold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isArabic ? contactForm.submitButtonAr : contactForm.submitButtonEn}
                  </motion.button>
                </div>
              </motion.form>
            </div>
          </div>

          {/* Map - Below the form */}
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
              height="350"
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
