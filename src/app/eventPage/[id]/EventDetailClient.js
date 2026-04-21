"use client"

import { useLanguage } from '@/context/LanguageContext'
import siteData from '@/data/siteData.json'
import styles from './EventDetailClient.module.css'

const EventDetailClient = () => {

  const { t, isArabic } = useLanguage();
  const formatArabicDigits = (value) =>
    value.replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
  const displayPhone = isArabic
    ? formatArabicDigits(siteData.contactInfo.phone)
    : siteData.contactInfo.phone;

  return (
    <section className={styles.eventPageSec}>
      <div className={styles.container}>
      <h1 className={styles.pageHeading}>{isArabic?"الفعاليات وتجارب بناء الفريق":"Events & Team Building Experience"}</h1>
        <p className={styles.para}>{isArabic?"سواء كنت تخطط لفعالية لبناء فرق العمل، أو حفل عيد ميلاد مليء بالإثارة، أو أي مناسبة خاصة، توفر غرف الهروب لديناتجربة فريدة لا تنسى.":"Whether you're planning a corporate team-building event, an exciting birthday party, or any special occasion, our immersive escape rooms offer a unique and unforgettable experience."}</p>
        <h3 className={styles.subheading}>{isArabic?"نصمم كل فعالية لتناسب احتياجاتك الخاصة":"We Tailor Each Event to suit your needs."}</h3>

        <div className={styles.eventContact}>
            <span style={{fontWeight:'bold',fontSize:'1.5rem'}}>{isArabic?"تواصل معنا على":"Contact us at"}</span>
            <h1 className={styles.contactNum}>{displayPhone}</h1>
            <p className={styles.para}>{isArabic?"للمزيد من التفاصيل أو لطلب عرض سعر مخصص لفعاليتك القادمة":"for more details or to request a customized quotation for your next event."}</p>
        </div>
        </div>
    </section>
  )
}

export default EventDetailClient