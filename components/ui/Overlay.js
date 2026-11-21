import styles from "./Overlay.module.css";

// Dækker hele skærmen med en besked, fx loaderen, "Tiden er udløbet" eller "Dine popkorn blev brændt".
// Indholdet står under hinanden i midten: illustration, overskrift og så children.
// Den kan ikke lukkes af sig selv - skal den kunne lukkes, så læg en knap i children.
//
//   open         - om den vises (standard: true)
//   title        - overskriften
//   illustration - fx popkorn-loaderen over overskriften
//   role         - "status" (standard) eller "alert" ved fejl, så skærmlæsere siger den med det samme
//   fadeIn       - om den toner frem (standard: true). false, når den afløser en loader, der allerede vises
//   children     - ekstra indhold, fx en tekst eller en knap
export default function Overlay({ open = true, title, illustration, role = "status", fadeIn = true, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay} role={role} aria-live="assertive" data-fade-in={fadeIn || undefined}>
      {illustration}
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
}
