'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const { language, setLanguage, t, isArabic } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/games', label: t('games') },
    { href: '/about', label: t('aboutUs') },
    { href: '/contact', label: t('contactUs') },
  ];

  const moreLinks = [
    { href: '/more/reviews', label: t('reviews') },
    { href: '/more/gallery', label: t('gallery') },
    { href: '/more/events', label: t('privateEvents') },
    { href: '/more/faq', label: t('faqs') },
  ];

  const isMoreActive = pathname.startsWith('/more');

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLangDropdown(false);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          {/* Book Now Button */}
          <Link href="/contact" className={`btn btn-gold ${styles.bookBtn}`}>
            {t('bookNow')}
          </Link>

          {/* Logo */}
          <Link href="/" className={`navbar-brand mx-auto ${styles.logo}`}>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>ENI</span>
              <span className={styles.logoIcon}>G</span>
              <span className={styles.logoMain}>MA</span>
            </div>
            <div className={styles.logoSubtext}>
              <span>ESCAPE</span>
              <span className={styles.keyIcon}>🔑</span>
              <span>GAMES</span>
            </div>
          </Link>

          {/* Language Selector */}
          <div 
            className={styles.langSelector}
            onClick={() => setLangDropdown(!langDropdown)}
            onMouseLeave={() => setLangDropdown(false)}
          >
            <span className={styles.flag}>{language === 'en' ? '🇬🇧' : '🇸🇦'}</span>
            <span>{language === 'en' ? 'ENGLISH' : 'العربية'}</span>
            <i className={`bi bi-chevron-down ${styles.chevron} ${langDropdown ? styles.rotated : ''}`}></i>
            
            {/* Language Dropdown */}
            <div className={`${styles.langDropdown} ${langDropdown ? styles.show : ''}`}>
              <button 
                className={`${styles.langOption} ${language === 'en' ? styles.activeLang : ''}`}
                onClick={(e) => { e.stopPropagation(); handleLanguageChange('en'); }}
              >
                <span className={styles.flag}>🇬🇧</span>
                <span>ENGLISH</span>
              </button>
              <button 
                className={`${styles.langOption} ${language === 'ar' ? styles.activeLang : ''}`}
                onClick={(e) => { e.stopPropagation(); handleLanguageChange('ar'); }}
              >
                <span className={styles.flag}>🇸🇦</span>
                <span>العربية</span>
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
            <ul className={`navbar-nav ${styles.navLinks}`}>
              {navLinks.map((link) => (
                <li key={link.href} className="nav-item">
                  <Link
                    href={link.href}
                    className={`nav-link ${styles.navLink} ${
                      pathname === link.href ? styles.active : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              
              {/* More Dropdown */}
              <li 
                className={`nav-item ${styles.dropdown}`}
                onMouseEnter={() => setMoreDropdown(true)}
                onMouseLeave={() => setMoreDropdown(false)}
              >
                <Link
                  href="/more"
                  className={`nav-link ${styles.navLink} ${isMoreActive ? styles.active : ''}`}
                >
                  {t('more')}
                  <i className="bi bi-chevron-down ms-1"></i>
                </Link>
                
                <div className={`${styles.dropdownMenu} ${moreDropdown ? styles.show : ''}`}>
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`${styles.dropdownItem} ${
                        pathname === link.href ? styles.activeItem : ''
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
