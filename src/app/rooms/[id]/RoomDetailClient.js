'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';
import Link from 'next/link';
import RoomCard from '@/components/RoomCard';
import siteData from '@/data/siteData.json';
import Image from 'next/image';
import BookingForm from '@/components/BookingForm';


export default function RoomDetailClient({ room }) {
  const { t, isArabic } = useLanguage();
  const [mounted, setMounted] = useState(false);

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

  // Encode image/video URLs to handle spaces in filenames
  const encodedImage = encodeURI(room.image);
  const roomHeroVideos = {
    1: '/video/Sherlock_story.mp4',
    2: '/video/VR Trailer .mp4',
    3: '/video/Sherlock_story.mp4',
    4: '/video/VR Trailer .mp4',
    5: '/video/Sherlock_story.mp4',
  };
  const roomVideo = roomHeroVideos[room.id];
  const encodedVideo = roomVideo ? encodeURI(roomVideo) : null;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={styles.hero} style={{ '--room-color': room.color }}>
        {encodedVideo ? (
          <video
            className={styles.heroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src={encodedVideo} type="video/mp4" />
          </video>
        ) : (
          <div className={styles.heroBg} style={{ backgroundImage: `url(${encodedImage})` }}></div>
        )}
        <div className={styles.heroOverlay}></div>
      </div>
    );
  }

  const genreLabels = {
    horror: { en: 'Horror', ar: 'رعب' },
    adventure: { en: 'Adventure', ar: 'مغامرة' },
    mystery: { en: 'Mystery', ar: 'غموض' },
  };


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

// const vrRoomCards = [
//   { id: 1, image: "/vr-room/Dragon-Tower-Dramatic-1 (1).png", players: "2-4" },
//   { id: 2, image: "/vr-room/Manor-of-Escape-Dramatic-1 (1).png", players: "2-4" },
//   { id: 3, image: "/vr-room/Pirates-Plague-Dramatic-1 (1).png", players: "2-4" },
//   { id: 4, image: "/vr-room/Runaway-Train-Screenshot-1 (1).png", players: "2-4" },
//   { id: 5, image: "/vr-room/Depths-of-Osiris-Dramatic-1 (1).png", players: "2-4" },
//   { id: 6, image: "/vr-room/Ninja-Trials-Screenshot-1 (1).png", players: "2-4" },
//   { id: 7, image: "/vr-room/Time-Travel-Paradox-Dramatic-1 (1).png", players: "2-4" },
//   { id: 8, image: "/vr-room/Space-Station-Tiberia-Dramatic-2 (1).png", players: "2-4" },
//   { id: 9, image: "/vr-room/Laserbots-Dramatic-1 (1).png", players: "2-4" },
// ];

  return (
    <>
      {/* Hero Section with Room Image */}
      <section 
        className={styles.hero}
        style={{ '--room-color': room.color }}
      >
        {encodedVideo ? (
          <video
            className={styles.heroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src={encodedVideo} type="video/mp4" />
          </video>
        ) : (
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${encodedImage})` }}
          ></div>
        )}
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
              {isArabic ? <Image className={styles.EnNameImg} src={room.nameEn} width={400} height={400} /> : <Image className={styles.EnNameImg} src={room.nameEn} width={400} height={400} />}
              {/* {room.subtitleEn && !isArabic && (
                <span className={styles.subtitle}>{room.subtitleEn}</span>
              )} */}
            </motion.h1>

            <motion.p
              className={styles.roomTitleAr}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {isArabic ? <Image className={styles.EnNameImg} src={room.nameAr} width={400} height={400} /> : <Image className={styles.EnNameImg} src={room.nameAr} width={400} height={400} />}
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
          {/* Warning */}
          {(room.warningEn || room.warningAr) && (
            <motion.div
              className={styles.warning}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <span className={styles.warningLabel}>
                {isArabic ? 'تحذير:' : 'WARNING:'}
              </span>
              <span className={styles.warningText}>
                {isArabic ? room.warningAr : room.warningEn}
              </span>
            </motion.div>
          )}

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

            {room.hasLivePerformers && (
              <div className={styles.infoItem}>
                <i className="bi bi-person-badge-fill"></i>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>
                    {isArabic ? 'ممثلين' : 'Performers'}
                  </span>
                  <span className={styles.infoValue}>
                    {isArabic ? 'ممثلين حقيقيين' : 'Live Performers'}
                  </span>
                </div>
              </div>
            )}

            {room.genre && (
              <div className={styles.infoItem}>
                <i className="bi bi-tag-fill"></i>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>
                    {isArabic ? 'النوع' : 'Genre'}
                  </span>
                  <span className={styles.infoValue}>
                    {isArabic
                      ? genreLabels[room.genre]?.ar
                      : genreLabels[room.genre]?.en}
                  </span>
                </div>
              </div>
            )}

            {room.difficulty && (
              <div className={styles.infoItem}>
                <i className="bi bi-star-fill"></i>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>
                    {isArabic ? 'الصعوبة' : 'Difficulty'}
                  </span>
                  <div className={styles.difficultyStars}>
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`bi ${
                          i < room.difficulty ? 'bi-star-fill' : 'bi-star'
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
       
      {room.id === 4 ? (
        <section id="games-section" className={`section-padding ${styles.roomsPageSection}`}>
          <div className="container">
            <BookingForm />
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
              {siteData.vrRoomCards.map((card) => (
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
      ) : (
        <section id="games-section" className={`section-padding ${styles.roomsPageSection}`}>
          <div className="container">
            <BookingForm />
            <motion.h2
              className="section-title"
              variants={titleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ position: 'relative', zIndex: 2, fontFamily: 'Skygraze, sans-serif' }}
            >
              {t('ourRooms')}
            </motion.h2>
            <motion.div
              className={styles.roomsPageList}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {siteData.rooms.map((oroom, index) => (
                room.id === oroom.id ? null : <RoomCard key={oroom.id} room={oroom} index={index} />
              ))}

              <motion.div
                className={`${styles.roomPageCard} ${styles.comingSoonPage}`}
                variants={comingSoonVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className={styles.comingSoonPageContent}>
                  <h3>{t('comingSoon')}</h3>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}


    </>
  );
}

