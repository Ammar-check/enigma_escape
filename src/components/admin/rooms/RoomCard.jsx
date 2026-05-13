import Link from 'next/link';
import styles from './RoomCard.module.css';

export default function RoomCard({ room, slotCount = 0, blockedCount = 0 }) {
  return (
    <Link href={`/admin/manage-rooms/${room.slug}`} className={styles.card}>
      <div className={styles.topRow}>
        <h3 className={styles.title}>{room.name}</h3>
        <span className={styles.badge}>{room.type.toUpperCase()}</span>
      </div>
      <p className={styles.players}>Players {room.minPlayers}-{room.maxPlayers}</p>
      <div className={styles.metaRow}>
        <span>{slotCount} slots</span>
        <span>{blockedCount} blocked</span>
      </div>
      <span className={styles.cta}>Add Slot</span>
    </Link>
  );
}
