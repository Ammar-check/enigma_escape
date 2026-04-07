'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './RoomCard.module.css';
import Image from 'next/image';

const cardVariants = {
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

export default function RoomCard({ room, showDetails = true, index = 0 }) {
  const { t, isArabic } = useLanguage();

  const genreLabels = {
    horror: { en: 'Horror', ar: 'رعب' },
    adventure: { en: 'Adventure', ar: 'مغامرة' },
    mystery: { en: 'Mystery', ar: 'غموض' },
  };

  return (
    <motion.div
      className={`${styles.roomCard} ${styles[`card${index+1}`]}`}
      initial={{ opacity: 0, x: -100 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ '--room-color': room.color }}
    >
      <Link href={`/rooms/${room.id}`} className={styles.roomLink} prefetch={true}>
        <div className={styles.roomImageWrapper}>
          <Image
            src={room.image}
            alt={isArabic ? room.nameAr : room.nameEn}
            className={styles.roomImage}
            width={500}
            height={400}
          />
          <div className={styles.roomOverlay}>
            <div className={styles.roomHeader}>
              <div className={styles.roomTitles}>
                <h3 className={styles.roomName}>
                  {/* {room.nameEn} */}
                  <Image className={styles.EnNameImg} src={room.nameEn} width={400} height={400} alt='room name' />
                </h3>
                {/* {room.subtitleEn && (
                  <span className={styles.roomSubtitle}>{room.subtitleEn}</span>
                )} */}
              </div>
              <span className={`btn btn-gold ${styles.roomBookBtn}`}>
                {t('bookNow')}
              </span>
            </div>
            <p className={styles.roomNameAr}>
              {/* {room.nameAr} */}
              <Image className={styles.ArNameImg} src={room.nameAr} width={400} height={400} alt='room name' />
            </p>
          </div>

        {showDetails && (
          <div className={styles.roomDetails}>
            <div className={styles.roomInfo}>
  <span>
    {isArabic ? (
      <>
        <Image className={styles.roomsIcon} src='/faces.svg' width={30} height={30} alt='face icon' />
        {' '}ممثل حي
      </>
    ) : (
      <>
        <Image className={styles.roomsIcon} src='/user.svg' width={30} height={30} alt='user icon' />
        {' '}{room.players}{' '}Players
      </>
    )}
  </span>

  <span>
    <Image className={`${styles.roomsIcon2} ${styles.roomsIcon}`} src='/sand-time.svg' style={{width:'20px',height:'20px'}} width={30} height={30} alt='time icon' />
    {' '}{room.duration}{' '}
    {isArabic ? 'دقيقة' : 'Min'}
  </span>

  {room.hasLivePerformers && (
    <span>
      {isArabic ? (
        <>
          <Image className={styles.roomsIcon} src='/user.svg' width={30} height={30} alt='user icon' />
          {' '}{room.players}{' '}لاعبين
        </>
      ) : (
        <>
          <Image className={styles.roomsIcon} src='/faces.svg' width={30} height={30} alt='face icon' />
          {' '}Live Performers
        </>
      )}
    </span>
  )}

  {room.genre && (
    <span>
      <Image className={styles.roomsIcon} src={room.icon} width={30} height={30} alt='hand icon' />
      {' '}
      {isArabic ? genreLabels[room.genre]?.ar : genreLabels[room.genre]?.en}
    </span>
  )}
</div>
            {room.difficulty && (
              <div className={styles.difficulty}>
                <span>{isArabic ? 'الصعوبة' : 'Difficulty'}</span>
                <div className={styles.difficultyStars}>
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${
                        i < room.difficulty ? 'bi-star-fill' : 'bi-star'
                      }`}
                    ></i>
                    
                  ))}
                  <span style={{ color: 'var(--gold-primary)', marginLeft:'10px' }}>{room.star}</span>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </Link>
    </motion.div>
  );
}

