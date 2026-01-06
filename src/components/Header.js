'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Header.module.css';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t, isArabic } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/#games', label: t('games'), isScroll: true },
    { href: '/events', label: t('privateEvents') },
    { href: '/about', label: t('aboutUs') },
    { href: '/more/reviews', label: t('reviews') },
    { href: '/more/gallery', label: t('gallery') },
    { href: '/more/faq', label: t('faqs') },
    { href: '/contact', label: t('contactUs') },
  ];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLangDropdown(false);
  };

  const handleNavClick = (e, link) => {
    if (link.isScroll && pathname === '/') {
      e.preventDefault();
      const gamesSection = document.querySelector('#games-section');
      if (gamesSection) {
        const headerHeight = 140;
        const elementPosition = gamesSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        setMobileMenuOpen(false);
      }
    } else if (link.isScroll) {
      // If not on home page, navigate to home page with hash
      window.location.href = '/#games';
    }
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      {/* Top Row */}
      <div className={styles.topRow}>
        <div className="container">
          <div className={styles.topRowContent}>
            {/* Book Now Button */}
            <a 
              href="https://bookeo.com/enigmaescapesa" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`btn btn-gold ${styles.bookBtn}`}
            >
              {t('bookNow')}
            </a>

            {/* Logo - Center */}
            <Link href="/" className={styles.logo}>
              <div className={styles.logoWrapper}>
                <Image src="/logo-enigma-yellow.webp" alt="Enigma Logo" width={180} height={70} />
              </div>
            </Link>

            {/* Language Selector */}
            <div
              className={styles.langSelector}
              onClick={() => setLangDropdown(!langDropdown)}
              onMouseLeave={() => setLangDropdown(false)}
            >
              <span className={styles.langCode}>{mounted ? (language === 'en' ? 'US' : 'SA') : 'US'}</span>
              <span className={styles.langText}>{mounted ? (language === 'en' ? 'EN' : 'AR') : 'EN'}</span>
              <i className={`bi bi-chevron-down ${styles.chevron} ${langDropdown ? styles.rotated : ''}`}></i>

              {/* Language Dropdown */}
              <div className={`${styles.langDropdown} ${langDropdown ? styles.show : ''}`}>
                <button
                  className={`${styles.langOption} ${language === 'en' ? styles.activeLang : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleLanguageChange('en'); }}
                >
                  <span className={styles.langCode}>US</span>
                  <span>ENGLISH</span>
                </button>
                <button
                  className={`${styles.langOption} ${language === 'ar' ? styles.activeLang : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleLanguageChange('ar'); }}
                >
                  <span className={styles.langCode}>SA</span>
                  <span>العربية</span>
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              className={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row - Navigation */}
      <nav className={`${styles.bottomRow} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        <div className="container">
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.href} className={styles.navItem}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                  onClick={(e) => {
                    if (link.isScroll) {
                      handleNavClick(e, link);
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
