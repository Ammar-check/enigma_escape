'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import siteData from '@/data/siteData.json';
import styles from './page.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function ContactPage() {
  const { t, isArabic } = useLanguage();
  const { contactInfo, contactForm } = siteData;

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
          <h1 className={styles.heroTitle}>{t('contactUs')}</h1>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className={`section-padding ${styles.contactSection}`}>
        <div className="container">
          <div className="row">
            {/* Contact Info */}
            <div className="col-lg-5 mb-5 mb-lg-0">
              <motion.div
                className={styles.contactInfo}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.h4 className={styles.contactTitle} variants={itemVariants}>
                  {isArabic ? contactInfo.companyNameAr : contactInfo.companyNameEn}
                </motion.h4>

                <motion.div className={styles.contactItem} variants={itemVariants}>
                  <i className="bi bi-clock"></i>
                  <div>
                    <h5>{t('hoursOfOperation')}</h5>
                    <p>{isArabic ? contactInfo.hours.sunWedAr : contactInfo.hours.sunWedEn}</p>
                    <p>{isArabic ? contactInfo.hours.thursdayAr : contactInfo.hours.thursdayEn}</p>
                    <p>{isArabic ? contactInfo.hours.fridayAr : contactInfo.hours.fridayEn}</p>
                  </div>
                </motion.div>

                <motion.div className={styles.contactItem} variants={itemVariants}>
                  <i className="bi bi-geo-alt-fill"></i>
                  <div>
                    <h5>{t('shorafatPark')}</h5>
                    <p>{isArabic ? contactInfo.addressAr : contactInfo.addressEn}</p>
                  </div>
                </motion.div>

                <motion.div className={styles.contactItem} variants={itemVariants}>
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <h5>{t('phone')}</h5>
                    <p>{contactInfo.phone}</p>
                  </div>
                </motion.div>

                <motion.div className={styles.contactItem} variants={itemVariants}>
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
                transition={{ duration: 0.8 }}
              >
                {contactForm.fields.map((field) => (
                  <motion.div key={field.id} className="mb-4" whileHover={{ scale: 1.01 }}>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.id}
                        name={field.name}
                        className="form-control"
                        rows={field.rows || 5}
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
                  </motion.div>
                ))}
                <div className={isArabic ? 'text-start' : 'text-end'}>
                  <motion.button
                    type="submit"
                    className="btn btn-gold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        '0 2px 15px rgba(212, 168, 75, 0.3)',
                        '0 5px 30px rgba(212, 168, 75, 0.6)',
                        '0 2px 15px rgba(212, 168, 75, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isArabic ? contactForm.submitButtonAr : contactForm.submitButtonEn}
                  </motion.button>
                </div>
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
