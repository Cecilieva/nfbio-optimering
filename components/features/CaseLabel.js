import Image from "next/image";
import styles from "./CaseLabel.module.css";

/**
 * "Sagsmappe"-linjen under "Tilbage" (kommende thrillere/gysere)
 * Figma "Sag" i "Filmside – topbar" (1842:64049) + "REC" (570:3180) – prikken blinker
 *
 * @param {object} props
 * @param {string} props.text fx "SAG NR. 0217 · THRILLER"
 */
export default function CaseLabel({ text }) {
  return (
    <div className={styles.label}>
      {/* REC er pynt → skjult for skærmlæsere */}
      <span className={styles.rec} aria-hidden="true">
        <span className={styles.dot}>
          {/* "Fra"-prikken nederst, "Til" ovenpå blinker */}
          <Image src="/icons/rec-dot-off.svg" alt="" width={10} height={10} className={styles.dotImage} />
          <Image
            src="/icons/rec-dot-on.svg"
            alt=""
            width={10}
            height={10}
            className={`${styles.dotImage} ${styles.dotOn}`}
          />
        </span>
        REC
      </span>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
