'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import siteData from '@/data/siteData.json';
import styles from './page.module.css';
import Image from 'next/image';

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
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus({ type: 'error', text: result.error || 'Failed to send message.' });
        return;
      }

      setStatus({ type: 'success', text: result.message || 'Message sent successfully.' });
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        message: '',
      });
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
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
          <h1 className={styles.heroTitle}>{t('contactUs')}</h1>
        </motion.div>
        {/* <div><img src="/contactLayer.svg" style={{position:'absolute',top:'67vh',left:0,zIndex:999,width:'100%'}} alt="design layer" /></div> */}
        {/* <img src='/layer-homeDiv.svg' alt='svg layer' style={{width:'100%',position:'absolute',bottom:0}}/> */}
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
                  <Image style={{ transform: 'rotate(15deg)' }} src='/smartphone.svg' width={30} height={30} alt='smartphone icon' />
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
                onSubmit={handleSubmit}
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
                        value={formData[field.name]}
                        onChange={handleChange}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        disabled={loading}
                      ></textarea>
                    ) : (
                      <input
                        id={field.id}
                        name={field.name}
                        type={field.type}
                        className="form-control"
                        placeholder={isArabic ? field.placeholderAr : field.placeholderEn}
                        required={field.required}
                        dir={isArabic ? 'rtl' : 'ltr'}
                        style={{ textAlign: isArabic ? 'right' : 'left' }}
                        value={formData[field.name]}
                        onChange={handleChange}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        disabled={loading}
                      />
                    )}
                  </motion.div>
                ))}
                {status.text && (
                  <p style={{ color: status.type === 'error' ? '#ff6666' : '#7dff9b', marginBottom: '16px' }}>
                    {status.text}
                  </p>
                )}
                <div className={isArabic ? 'text-start' : 'text-end'}>
                  <motion.button
                    type="submit"
                    className=""
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
                    style={{color:'var(--gold-primary)',border:'1px solid var(--gold-primary)',background:'transparent',padding:'12px 35px',borderRadius:'5px'}}
                    disabled={loading}
                  >
                    {loading ? (isArabic ? '...جاري الإرسال' : 'Sending...') : (isArabic ? contactForm.submitButtonAr : contactForm.submitButtonEn)}
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
