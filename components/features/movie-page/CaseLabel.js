import Image from "next/image";
import styles from "./CaseLabel.module.css";

/**
 * KAMPAGNE: CLAYFACE – "Sagsmappe"-linjen under "Tilbage"
 * Figma "Sag" + "REC"
 *
 * @param {object} props
 * @param {string} props.text fx "SAG NR. 0217 · THRILLER"
 */
export default function CaseLabel({ text }) {
  return (
    <div className={styles.label}>
      <span className={styles.rec} aria-hidden="true">
        <span className={styles.dot}>
          {/* den øverste prik blinker */}
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
