'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './RoomCard.module.css';
import Image from 'next/image';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function RoomCard({ room, showDetails = true }) {
  const { t, isArabic } = useLanguage();

  const genreLabels = {
    horror: { en: 'Horror', ar: 'رعب' },
    adventure: { en: 'Adventure', ar: 'مغامرة' },
    mystery: { en: 'Mystery', ar: 'غموض' },
  };

  return (
    <motion.div
      className={styles.roomCard}
      variants={cardVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      }}
      style={{ '--room-color': room.color }}
    >
      <div className={styles.roomImageWrapper}>
        <img
          src={room.image}
          alt={isArabic ? room.nameAr : room.nameEn}
          className={styles.roomImage}
        />
        <div className={styles.roomOverlay}>
          <h3 className={styles.roomName}>
            {isArabic ? room.nameAr : room.nameEn}
          </h3>
          {room.subtitleEn && !isArabic && (
            <span className={styles.roomSubtitle}>{room.subtitleEn}</span>
          )}
          <p className={styles.roomNameAr}>
            {isArabic ? room.nameEn : room.nameAr}
          </p>
        </div>
        <Link href="/contact" className={`btn btn-gold ${styles.roomBookBtn}`}>
          {t('bookNow')}
        </Link>

        {showDetails && (
          <div className={styles.roomDetails}>
            <div className={styles.roomInfo}>
              <span>
                <i className="bi bi-people-fill"></i> {room.players}{' '}
                {isArabic ? 'لاعبين' : 'Players'}
              </span>
              <span>
                <i className="bi bi-clock-fill"></i> {room.duration}{' '}
                {isArabic ? 'دقيقة' : 'Min'}
              </span>
              {room.hasLivePerformers && (
                <span>
                  <i className="bi bi-person-badge-fill"></i>{' '}
                  {isArabic ? 'ممثلين حقيقيين' : 'Live Performers'}
                </span>
              )}
              {room.genre && (
                <span>
                  <i className="bi bi-tag-fill"></i>{' '}
                  {isArabic
                    ? genreLabels[room.genre]?.ar
                    : genreLabels[room.genre]?.en}
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      
    </motion.div>
  );
}

