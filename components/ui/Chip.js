import styles from "./Chip.module.css";

/**
 * A small toggle, e.g. a month filter or the number of tickets.
 * Figma: "Option button".
 *
 * @param {object} props
 * @param {boolean} [props.selected] Shown with aria-pressed
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className] Extra CSS class from the parent
 * @param {React.ReactNode} props.children
 */
export default function Chip({ selected = false, className, children, ...rest }) {
  const classes = className ? `${styles.chip} ${className}` : styles.chip;

  return (
    <button type="button" aria-pressed={selected} className={classes} {...rest}>
      {children}
    </button>
  );
}
