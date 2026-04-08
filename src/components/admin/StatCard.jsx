import styles from './StatCard.module.css';

export default function StatCard({ label, value, icon, change }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>{label}</span>
          <span className={styles.cardValue}>{value}</span>
        </div>
        <div className={styles.cardIcon}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      <div className={styles.cardChange}>{change}</div>
    </div>
  );
}