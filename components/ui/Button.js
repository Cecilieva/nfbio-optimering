import Link from "next/link";
import styles from "./Button.module.css";

/**
 * En knap. Får den et href, bliver den til et link, der ligner en knap.
 * Udseendet vælges med "variant" og styles i Button.module.css.
 *
 * Varianter:
 *   primary   – blå knap, fx "Log ind"
 *   secondary – knap med kun en kant, fx "Luk" og "Opret profil"
 *   ghost     – ikke stylet endnu
 *   tile      – et stort valgkort, fx en by på Vælg by
 *
 * @param {object} props
 * @param {"primary" | "secondary" | "ghost" | "tile"} [props.variant="primary"]
 * @param {string} [props.href] Hvis den er sat, vises et Link i stedet for en <button>
 * @param {"button" | "submit"} [props.type="button"] "submit" sender den formular, knappen står i
 * @param {boolean} [props.disabled]
 * @param {string} [props.className] Ekstra CSS-klasse fra forælderen
 * @param {React.ReactNode} props.children Teksten inde i knappen
 */
export default function Button({
  variant = "primary",
  href,
  type = "button",
  className,
  children,
  // "...rest" samler alle andre props (fx onClick, aria-current, disabled),
  // så vi kan sende dem videre til knappen eller linket nedenfor.
  ...rest
}) {
  // Brug altid knap-klassen, og tilføj den ekstra klasse, hvis forælderen har sendt en
  let classes = styles.button;
  if (className) {
    classes = `${styles.button} ${className}`;
  }

  // CSS'en vælger udseendet ud fra data-variant, fx .button[data-variant="tile"]

  // Med href: et link, der ligner en knap
  if (href) {
    return (
      <Link href={href} data-variant={variant} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  // Uden href: en almindelig knap
  return (
    <button type={type} data-variant={variant} className={classes} {...rest}>
      {children}
    </button>
  );
}
