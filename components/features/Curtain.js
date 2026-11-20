import styles from "./Curtain.module.css";

// Fortæppet foran traileren (figma "Fortæppe")
// tæppet går til siden af sig selv når det vises → animationen ligger i css'en
export default function Curtain({ children }) {
  return (
    <div className={styles.stage}>
      {/* traileren nederst */}
      {children}

      {/* tæppet ovenpå – kun pynt, så skærmlæsere springer det over */}
      <div className={styles.curtain} aria-hidden="true">
        <div className={`${styles.half} ${styles.left}`} />
        <div className={`${styles.half} ${styles.right}`} />
        <div className={styles.spot} />
        <div className={styles.vignette} />
      </div>
    </div>
  );
}
