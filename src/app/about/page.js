'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import siteData from '@/data/siteData.json';
import styles from './page.module.css';

export default function AboutPage() {
  const { t, isArabic } = useLanguage();
  const containerRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const stats = [
    { number: '5+', labelEn: 'Escape Rooms', labelAr: 'غرف هروب' },
    { number: '10K+', labelEn: 'Happy Players', labelAr: 'لاعب سعيد' },
    { number: '60', labelEn: 'Minutes of Thrill', labelAr: 'دقيقة من الإثارة' },
    { number: '4.9', labelEn: 'Star Rating', labelAr: 'تقييم نجوم' },
  ];

  const aboutContent = {
    en: {
      title: 'ENIGMA ESCAPE GAMES',
      description: `Enigma Escape Games offers a dynamic range of immersive escape experiences 
        designed to thrill, challenge, and captivate. From intricately themed rooms 
        with live actors, to cutting-edge VR adventures, to exciting outdoor escape 
        quests. We're redefining entertainment in the Kingdom of Saudi Arabia by 
        blending innovation, creativity, and adrenaline-pumping fun for 60 minutes 
        you'll never forget!`,
      missionTitle: 'Our Mission',
      missionText: `To create unforgettable immersive experiences that challenge the mind, 
        ignite teamwork, and deliver pure adrenaline-fueled entertainment.`,
      visionTitle: 'Our Vision',
      visionText: `To be the leading escape room destination in the Middle East, known for 
        innovation, quality, and delivering experiences that exceed expectations.`,
    },
    ar: {
      title: 'إنجما لغرف الهروب',
      description: `تقدم إنجما لغرف الهروب مجموعة متنوعة من تجارب الهروب الغامرة 
        المصممة للإثارة والتحدي والجذب. من الغرف ذات الطابع المعقد 
        مع ممثلين حقيقيين، إلى مغامرات الواقع الافتراضي المتطورة، إلى مهام الهروب الخارجية المثيرة. 
        نحن نعيد تعريف الترفيه في المملكة العربية السعودية من خلال 
        مزج الابتكار والإبداع والمتعة المليئة بالأدرينالين لمدة 60 دقيقة 
        لن تنساها أبداً!`,
      missionTitle: 'مهمتنا',
      missionText: `إنشاء تجارب غامرة لا تُنسى تتحدى العقل، 
        وتشعل العمل الجماعي، وتقدم ترفيهاً مليئاً بالأدرينالين.`,
      visionTitle: 'رؤيتنا',
      visionText: `أن نكون وجهة غرف الهروب الرائدة في الشرق الأوسط، المعروفة 
        بالابتكار والجودة وتقديم تجارب تتجاوز التوقعات.`,
    },
  };

  const content = isArabic ? aboutContent.ar : aboutContent.en;

  return (
    <div className={styles.pageWrapper} ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroBanner}>
        <div className={styles.heroOverlay}></div>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.heroTitle}>{t('aboutUs')}</h1>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className={`section-padding ${styles.aboutSection}`}>
        <div className="container">
          <div className="row align-items-center">
            {/* Text Content */}
            <div className="col-lg-5 mb-5 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: isArabic ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className={styles.aboutTitle}>{content.title}</h2>
                <p className={styles.aboutText}>{content.description}</p>
              </motion.div>
            </div>

            {/* Video/Image Section */}
            <div className="col-lg-7">
              <motion.div
                className={styles.videoWrapper}
                initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className={styles.videoContainer}>
                  {!showVideo ? (
                    <>
                      <img
                        src="/1_03.png"
                        alt="Enigma Escape Games Experience"
                        className={styles.videoThumbnail}
                      />
                      <motion.button
                        className={styles.playButton}
                        onClick={() => setShowVideo(true)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(212, 168, 75, 0.3)',
                            '0 0 40px rgba(212, 168, 75, 0.6)',
                            '0 0 20px rgba(212, 168, 75, 0.3)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <i className="bi bi-play-fill"></i>
                      </motion.button>
                    </>
                  ) : (
                    <iframe
                      className={styles.videoIframe}
                      src="https://www.youtube.com/embed/KBIe2-9VG_U?autoplay=1"
                      title="Enigma Escape Games"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
                <div className={styles.videoFrame}></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Parallax */}
      <section className={styles.statsSection}>
        <motion.div className={styles.parallaxBg} style={{ y }}></motion.div>
        <div className={styles.statsOverlay}></div>
        <div className="container">
          <motion.div className={styles.statsGrid} style={{ opacity }}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.statItem}
                whileHover={{ scale: 1.1, y: -10 }}
              >
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>
                  {isArabic ? stat.labelAr : stat.labelEn}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section className={`section-padding ${styles.missionSection}`}>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <motion.div
                className={styles.missionCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className={styles.missionIcon}>
                  <i className="bi bi-bullseye"></i>
                </div>
                <h3>{content.missionTitle}</h3>
                <p>{content.missionText}</p>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                className={styles.missionCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className={styles.missionIcon}>
                  <i className="bi bi-eye"></i>
                </div>
                <h3>{content.visionTitle}</h3>
                <p>{content.visionText}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
