import Image from "next/image";
import styles from "./Spotlight.module.css";

/**
 * Figma "Lyskegle (drejepunkt)": a projector light cone that flickers on
 * and swings once (2.4 s). Place it inside a positioned, overflow-clipped parent;
 * the pivot sits at the parent's top centre.
 */
export default function Spotlight() {
  return (
    <div className={styles.pivot} aria-hidden="true">
      <Image
        className={styles.cone}
        src="/lyskegle.svg"
        alt=""
        width={1196}
        height={814}
        priority
      />
    </div>
  );
}
