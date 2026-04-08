import styles from './VideoQueue.module.css';

const videos = [
  { id: 1, name: 'Ahmed Al-Rashid', room: 'Butcher', time: '2:00 PM', date: 'Today', sent: false },
  { id: 2, name: 'Sara Mohammed', room: 'Sherlock', time: '3:30 PM', date: 'Today', sent: false },
  { id: 3, name: 'Khalid Ibrahim', room: 'VR', time: '11:00 AM', date: 'Today', sent: true },
  { id: 4, name: 'Fatima Hassan', room: 'Lost City', time: '5:00 PM', date: 'Today', sent: false },
];

export default function VideoQueue() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Video Queue</h3>
        <span className={styles.pending}>
          {videos.filter(v => !v.sent).length} pending
        </span>
      </div>

      <div className={styles.list}>
        {videos.map((v) => (
          <div key={v.id} className={`${styles.item} ${v.sent ? styles.sent : ''}`}>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{v.name}</span>
              <span className={styles.itemMeta}>{v.room} · {v.time}</span>
            </div>
            <button
              className={`${styles.sendBtn} ${v.sent ? styles.sentBtn : ''}`}
            >
              {v.sent ? (
                <><i className="bi bi-check-lg"></i> Sent</>
              ) : (
                <><i className="bi bi-send-fill"></i> Send</>
              )}
            </button>
          </div>
        ))}
      </div>

      <a href="/admin/videos" className={styles.viewAll}>View full queue →</a>
    </div>
  );
}