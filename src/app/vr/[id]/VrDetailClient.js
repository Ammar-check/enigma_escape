'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './VrDetailClient.module.css';
import Link from 'next/link';
import siteData from '@/data/siteData.json';
import Image from 'next/image';
import { useParams } from 'next/navigation';


export default function RoomDetailClient({ room }) {
  const { t, isArabic } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const params = useParams();
  const currentId = Number(params.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log(room);

  if (!room) {
    return (
      <div className={styles.notFound}>
        <h1>Room Not Found</h1>
        <Link href="/" className="btn btn-gold">Back to Home</Link>
      </div>
    );
  }

  // Encode image URL to handle spaces in filenames
  const encodedImage = encodeURI(room.image);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={styles.hero} style={{ '--room-color': room.color }}>
        <div className={styles.heroBg} style={{ backgroundImage: `url(${encodedImage})` }}></div>
        <div className={styles.heroOverlay}></div>
      </div>
    );
  }


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

  return (
    <>
      {/* Hero Section with Room Image */}
      <section
        className={styles.hero}
        style={{ '--room-color': room.color }}
      >
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url(${encodedImage})` }}
        ></div>
        <div className={styles.heroOverlay}></div>

        <div className="container">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h1
              className={styles.roomTitle}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ color: room.color }}
            >
              {room.nameEn}
            </motion.h1>

            <motion.p
              className={styles.roomTitleAr}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {room.nameAr}
            </motion.p>

            <motion.a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-gold ${styles.bookBtn}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('bookNow')}
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Room Details Section */}
      <section
        className={styles.detailsSection}
        style={{ backgroundImage: `url(${encodedImage})` }}
      >
        <div className={styles.detailsOverlay}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>

          {/* Description */}
          <motion.div
            className={styles.description}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p>{isArabic ? room.descriptionAr : room.descriptionEn}</p>
          </motion.div>

          {/* Room Info */}
          <motion.div
            className={styles.roomInfo}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className={styles.infoItem}>
              <i className="bi bi-people-fill"></i>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>
                  {isArabic ? 'عدد اللاعبين' : 'No. of Players'}
                </span>
                <span className={styles.infoValue}>{room.players}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <i className="bi bi-clock-fill"></i>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>
                  {isArabic ? 'الوقت' : 'Time'}
                </span>
                <span className={styles.infoValue}>
                  {room.duration} {isArabic ? 'دقيقة' : 'Min'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Back Link */}
          <motion.div
            className={styles.backLink}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Link href="/#games-section" className={styles.backBtn}>
              <i className="bi bi-arrow-left"></i>
              {isArabic ? 'العودة إلى الغرف' : 'Back to Rooms'}
            </Link>
          </motion.div>
        </div>
      </section>


      <section id="games-section" className={`section-padding ${styles.roomsPageSection}`}>
        <div className="container">
          <motion.h2
            className={`section-title ${styles.vrRoomsTitle}`}
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ position: "relative", zIndex: 2, fontFamily: "Skygraze, sans-serif" }}
          >
            VR ROOM
          </motion.h2>

          <motion.div
            className={styles.vrCardGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {siteData.vrRoomCards.filter((card)=> card.id !== currentId).map((card) => (
              <motion.a
                key={card.id}
                // href={room.bookingUrl || siteData.bookingUrl}
                // target="_blank"
                // rel="noopener noreferrer"
                className={styles.vrCard}
                variants={comingSoonVariants}
              >
                <Link href={`/vr/${card.id}`}>
                  <div className={styles.vrImageWrap}>
                    <Image
                      src={card.image}
                      alt={`VR room ${card.id}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 576px) 100vw, 33vw"
                      className={styles.vrCardImage}
                    />
                  </div>

                  <div className={styles.vrCardTopBadge}>
                    <Image
                      src="/vr-room/vr-glasses-300x300 (2).png"
                      alt="VR glasses"
                      width={54}
                      height={54}
                      className={styles.vrGlassesIcon}
                    />
                  </div>

                  <div className={styles.vrPlayersTag}>
                    <div className={styles.vrPlayersDefault}>
                      <i className="bi bi-people"></i>
                      <span>{card.players}</span>
                    </div>
                    <Image
                      src="/vr-room/IMG_3046 (1) (1).png"
                      alt={`Players ${card.players}`}
                      width={74}
                      height={50}
                      className={styles.vrPlayersHoverImage}
                    />
                  </div>

                  <div className={styles.vrCardOverlay}>
                    <span className={styles.vrBookButton}>BOOK<br />NOW</span>
                  </div>
                </Link>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}

