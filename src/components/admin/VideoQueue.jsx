import styles from './VideoQueue.module.css';

export default function VideoQueue({ videos = [] }) {
  const pendingCount = videos.filter((v) => !v.sent).length;
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Video Queue</h3>
        <span className={styles.pending}>{pendingCount} pending</span>
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
        {videos.length === 0 && <div className={styles.item}>No video requests pending.</div>}
      </div>

      <a href="/admin/videos" className={styles.viewAll}>View full queue →</a>
    </div>
  );
}