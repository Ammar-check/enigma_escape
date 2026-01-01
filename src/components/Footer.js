'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';
import Image from 'next/image';

export default function Footer() {
  const { t, isArabic } = useLanguage();
  
  const socialLinks = [
    { icon: 'bi-instagram', href: 'https://www.instagram.com/enigmaescapeksa', label: 'Instagram' },
    { icon: 'bi-google', href: 'https://google.com', label: 'Google' },
    { icon: 'bi-youtube', href: 'https://www.youtube.com/@EnigmaEscapeGames', label: 'YouTube' },
    { icon: 'bi-tiktok', href: 'https://www.tiktok.com/@enigmaescapeksa', label: 'TikTok' },
  ];

  return (
    <footer className={styles.footer}>
      {/* Circuit Divider */}
      <div className={styles.circuitDivider}>
        <div className={styles.circuitLine}></div>
        <div className={styles.circuitDot}></div>
      </div>

      <div className="container pt-5">
        {/* Logo */}
        <motion.div 
          className={styles.logoSection}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className={styles.logo}>
            <div className={styles.logoText}>
              <Image src="/enigma_escape/logo-enigma-yellow.webp" alt="Enigma logo" width={100} height={80} />
            </div>
           
          </Link>
        </motion.div>

        {/* Social Icons */}
        <motion.div 
          className={styles.socialIcons}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {socialLinks.map((social, index) => (
            <motion.a 
              key={index}
              href={social.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink}
              aria-label={social.label}
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className={`bi ${social.icon}`}></i>
            </motion.a>
          ))}
        </motion.div>

        {/* Divider Line */}
        <hr className={styles.dividerLine} />

        {/* Copyright */}
        <motion.div 
          className={styles.copyright}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p>{t('copyright')}</p>
        </motion.div>
      </div>
    </footer>
  );
}
