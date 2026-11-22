import styles from "./ProfileCard.module.css";

// Et kort på profilen med en overskrift, fx "Mine oplysninger" og "Mine billetter"
export default function ProfileCard({ title, children }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  );
}

// Én linje i "Mine oplysninger": navnet til venstre og værdien til højre
export function ProfileRow({ label, children }) {
  return (
    <p className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{children}</span>
    </p>
  );
}
