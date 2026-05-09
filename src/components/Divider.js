import styles from './Divider.module.css';

export default function Divider({ className = '', style }) {
  return (
    <div
      className={`${styles.divider} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
