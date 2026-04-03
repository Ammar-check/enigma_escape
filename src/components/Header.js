'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Header.module.css';
import Image from 'next/image';
import siteData from '@/data/siteData.json';
import { color } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t, isArabic } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState(null);


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
  {
    href: '#',
    label: t('games'),
    dropdown: [
      { href: `/rooms/1`, label: isArabic ? '!الجزار' : 'THE BUTCHER' },
      { href: `/rooms/2`, label: isArabic ? 'المدينة المفقودة' : 'THE LOST CITY' },
      { href: `/rooms/3`, label: isArabic ? 'شيرلوك وجهاز يوم القيامة' : 'SHERLOCK & Doomsday Device' },
      { href: `/rooms/4`, label: isArabic ? 'غرف الواقع الافتراضي' : 'VR ROOMS' },
      { href: `/rooms/5`, label: isArabic ? 'مغامرات هروب خارجية' : 'OUTDOOR ESCAPE' },
    ]
  },
  { href: '/about', label: t('aboutUs') },
  {
    href: '#',
    label: t('privateEvents'),
    dropdown: [
      { href: '/events', label: isArabic?'حفلات / أعياد الميلاد':'Parties / Birthday' },
      { href: '/events', label:isArabic?'الشركات / بناء الفريق': 'Corporate / Team Building' },
      { href: '/events', label:isArabic? 'الفعاليات الخارجية / الرحلات المدرسية':'External Events / School Trips' },
    ]
  },
  {
    href: '#',
    label: isArabic ? 'المزيد' : 'MORE',
    dropdown: [
      { href: '/more/reviews', label: t('reviews') },
      { href: '/more/gallery', label: t('gallery') },
      { href: '/more/faq', label: t('faqs') },
      { href: '#', label: isArabic?'العروض':'OFFERS' },
    ]
  },
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

  const toggleDropdown = (label) => {
  setOpenDropdown(openDropdown === label ? null : label);
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
              className={`btn  ${styles.bookBtn} `} data-text={isArabic?'احجز الآن':'BOOK NOW'}
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
              <span className={styles.langCode}>{mounted ? (language === 'en' ? 'ENGLISH' : 'عربي') : <Image className={styles.flagImg} src='/saudiFlag.svg' width={30} height={30} alt='flag'/>}</span>
              <span className={styles.langText}>{mounted ? (language === 'en' ? <Image className={styles.flagImg} src='/engFlag.svg' width={30} height={30} alt='flag'/> : <Image className={styles.flagImg} src='/saudiFlag.svg' width={30} height={30} alt='flag'/>) : 'us'}</span>
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
      <li
  key={link.href}
  className={`${styles.navItem} ${link.dropdown ? styles.navHasDropdown : ''} ${
    openDropdown === link.label ? styles.mobileDropdownOpen : ''
  }`}
>
      <Link
  href={link.href}
  className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
  onClick={(e) => {
    if (link.dropdown) {
      e.preventDefault(); // 🔥 STOP navigation
      toggleDropdown(link.label);
    } else if (link.isScroll) {
      handleNavClick(e, link);
    } else {
      setMobileMenuOpen(false);
    }
  }}
>
        {link.label}
        {link.dropdown && (
          <i
            className="bi bi-chevron-down"
            style={{
              fontSize: '0.7rem',
              marginLeft: '4px',
              transition: 'transform 0.3s ease',
              transform: openDropdown === link.label ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block'
            }}
          ></i>
        )}
      </Link>

      {link.dropdown && (
        <ul className={styles.navDropdown}>
          {link.dropdown.map((sub) => (
            <li key={sub.href} className={styles.navDropdownItem}>
              <Link
                href={sub.href}
                className={styles.navDropdownLink}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpenDropdown(null);
                }}
              >
                {sub.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  ))}
</ul>
        </div>
      </nav>
    </header>
  );
}
