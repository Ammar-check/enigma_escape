'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    home: 'HOME',
    games: 'GAMES',
    aboutUs: 'ABOUT US',
    contactUs: 'CONTACT US',
    more: 'MORE',
    bookNow: 'BOOK NOW',
    english: 'ENGLISH',
    arabic: 'ARABIC',
    
    // Hero
    minutes: 'MINUTES',
    heroSubtitle: 'THAT YOU WILL NEVER FORGET',
    
    // Sections
    ourRooms: 'OUR ROOMS',
    reviews: 'REVIEWS',
    gallery: 'GALLERY',
    privateEvents: 'PRIVATE EVENTS',
    faqs: "FAQ'S",
    exploreMore: 'EXPLORE MORE',
    
    // Rooms
    theButcher: 'THE BUTCHER',
    theLostCity: 'THE LOST CITY',
    sherlock: 'SHERLOCK',
    vrRooms: 'VR ROOMS',
    outdoorEscapeGames: 'OUTDOOR ESCAPE GAMES',
    comingSoon: 'COMING SOON',
    players: 'Players',
    min: 'Min',
    livePerformers: 'Live Performers',
    horror: 'Horror',
    adventure: 'Adventure',
    mystery: 'Mystery',
    difficulty: 'Difficulty',
    
    // Contact
    enigmaEscapeGames: 'Enigma Escape Games',
    hoursOfOperation: 'Hours of Operation:',
    shorafatPark: 'Shorafat Park:',
    phone: 'Phone:',
    email: 'Email:',
    fullName: 'Full Name',
    phoneInput: 'PHONE',
    emailAddress: 'EMAIL ADDRESS',
    message: 'MESSAGE',
    sendMessage: 'Send Message',
    
    // Hours
    sunWed: 'Sunday – Wednesday | 2:00 pm – 11:30 am',
    thursday: 'Thursday | 2:00 pm – 12:30 am',
    friday: 'Friday | 3:50 pm – 12:30 am',
    
    // Address
    address: 'Enigma Escape Games, King Faisal Ibn Abd Al Aziz, Al Khobar 34218, Saudi Arabia',
    
    // Footer
    copyright: '© 2025 Enigma Escape Games. All Rights Reserved.',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    games: 'الألعاب',
    aboutUs: 'من نحن',
    contactUs: 'اتصل بنا',
    more: 'المزيد',
    bookNow: 'احجز الآن',
    english: 'الإنجليزية',
    arabic: 'العربية',
    
    // Hero
    minutes: 'دقيقة',
    heroSubtitle: 'لن تنساها أبداً',
    
    // Sections
    ourRooms: 'غرفنا',
    reviews: 'التقييمات',
    gallery: 'المعرض',
    privateEvents: 'المناسبات الخاصة',
    faqs: 'الأسئلة الشائعة',
    exploreMore: 'استكشف المزيد',
    
    // Rooms
    theButcher: 'الجزّار',
    theLostCity: 'المدينة المفقودة',
    sherlock: 'شيرلوك',
    vrRooms: 'غرف الواقع الافتراضي',
    outdoorEscapeGames: 'مغامرات هروب خارجية',
    comingSoon: 'قريباً',
    players: 'لاعبين',
    min: 'دقيقة',
    livePerformers: 'ممثلين حقيقيين',
    horror: 'رعب',
    adventure: 'مغامرة',
    mystery: 'غموض',
    difficulty: 'الصعوبة',
    
    // Contact
    enigmaEscapeGames: 'إنجما لغرف الهروب',
    hoursOfOperation: 'ساعات العمل:',
    shorafatPark: 'شرفات بارك:',
    phone: 'الهاتف:',
    email: 'البريد الإلكتروني:',
    fullName: 'الاسم الكامل',
    phoneInput: 'الهاتف',
    emailAddress: 'البريد الإلكتروني',
    message: 'الرسالة',
    sendMessage: 'إرسال الرسالة',
    
    // Hours
    sunWed: 'الأحد – الأربعاء | 2:00 م – 11:30 ص',
    thursday: 'الخميس | 2:00 م – 12:30 ص',
    friday: 'الجمعة | 3:50 م – 12:30 ص',
    
    // Address
    address: 'إنجما لغرف الهروب، الملك فيصل بن عبد العزيز، الخبر 34218، المملكة العربية السعودية',
    
    // Footer
    copyright: 'حقوق الطبع والنشر © 2025 إنجما لغرف الهروب. جميع الحقوق محفوظة.',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('enigma-language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('enigma-language', language);
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isArabic: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

