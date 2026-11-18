import styles from "./Chip.module.css";

/**
 * A small toggle, e.g. a month filter or the number of tickets.
 * Figma: "Option button".
 *
 * Variants:
 *   outline – visible border, e.g. the month filters under "Kommende film"
 *   subtle  – the border has the same color as the background, e.g. the format buttons ("Formater") on /film
 *
 * @param {object} props
 * @param {"outline" | "subtle"} [props.variant="outline"]
 * @param {boolean} [props.selected] Shown with aria-pressed
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className] Extra CSS class from the parent
 * @param {React.ReactNode} props.children
 */
export default function Chip({ selected = false, variant = "outline", className, children, ...rest }) {
  const classes = className ? `${styles.chip} ${className}` : styles.chip;

  return (
    <button type="button" aria-pressed={selected} data-variant={variant} className={classes} {...rest}>
      {children}
    </button>
  );
}
