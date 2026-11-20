import styles from "./Overlay.module.css";

// Dækker hele skærmen med en besked, fx "Vi popper dine pladser".
// Den kan ikke lukkes af sig selv - skal den kunne lukkes, så læg en knap i children.
//
//   open     - om den vises
//   title    - overskriften
//   role     - "status" (standard) eller "alert" ved fejl, så skærmlæsere siger den med det samme
//   children - ekstra indhold, fx en knap
export default function Overlay({ open, title, role = "status", children }) {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay} role={role} aria-live="assertive">
      <div className={styles.content}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
