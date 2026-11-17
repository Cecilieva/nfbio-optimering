import Link from "next/link";
import styles from "./Button.module.css";

/**
 * A button, or a link that looks like one when it gets href.
 * Only variants that exist in Figma are styled in Button.module.css; the rest are still unstyled.
 *
 * @param {object} props
 * @param {"primary" | "secondary" | "ghost" | "tile"} [props.variant="primary"]
 *   tile: card-like choice button, e.g. a city on /by (Figma "By – …")
 * @param {string} [props.href] Renders a Link instead of a <button>
 * @param {"button" | "submit"} [props.type="button"]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = "primary",
  href,
  type = "button",
  className,
  children,
  ...rest
}) {
  const classes = [styles.button, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} data-variant={variant} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} data-variant={variant} className={classes} {...rest}>
      {children}
    </button>
  );
}
