import styles from "./Overlay.module.css";

/**
 * Covers the whole screen with a message, e.g. "Vi popper dine pladser".
 * Not dismissable on its own – put a button in children if it should be.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {"status" | "alert"} [props.role="status"] "alert" for errors
 * @param {React.ReactNode} [props.children]
 */
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
