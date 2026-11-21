import styles from "./LoadingDots.module.css";

// Tre prikker efter en overskrift, der kommer frem én ad gangen (Figma "Prikker – loader").
// Sæt den lige efter teksten i overskriften, fx "Indlæser" + <LoadingDots />.
// Prikkerne har overskriftens farve og er kun pynt (aria-hidden).
export default function LoadingDots() {
  return (
    <span className={styles.dots} aria-hidden="true">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}
