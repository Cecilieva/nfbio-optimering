import Image from "next/image";
import styles from "./CaseLabel.module.css";

/**
 * Den lille "sagsmappe"-linje under "Tilbage" på filmsiden til kommende thrillere og gysere.
 * Figma: "Sag" i "Filmside – topbar" på Clayface-filmsiden (node 1842:64049) med komponenten "REC" (node 570:3180),
 * hvor prikken blinker mellem "Til" og "Fra".
 *
 * @param {object} props
 * @param {string} props.text Teksten efter REC, fx "SAG NR. 0217 · THRILLER"
 */
export default function CaseLabel({ text }) {
  return (
    <div className={styles.label}>
      {/* Figma "REC": prikken og ordet er pynt, så skærmlæsere springer dem over */}
      <span className={styles.rec} aria-hidden="true">
        <span className={styles.dot}>
          {/* "Fra"-prikken ligger nederst, "Til"-prikken ovenpå blinker */}
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
