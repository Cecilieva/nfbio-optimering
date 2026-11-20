import Link from "next/link";
import styles from "./BackLink.module.css";

/**
 * "Tilbage"-knappen. Figma: "Knap", Type=Tilbage (node 2858:15010).
 * Pil og tekst; ved hover bliver begge accent/Sekundær.
 * Pilen er SVG direkte i koden med currentColor, så den altid har samme farve som teksten.
 * Bruges øverst på filmsiden (MovieHero) og i bestillingsflowet (StepHeader).
 *
 * @param {object} props
 * @param {string} props.href Hvor knappen fører hen
 * @param {React.ReactNode} [props.children="Tilbage"] Teksten
 * @param {string} [props.className] Ekstra CSS-klasse fra forælderen
 */
export default function BackLink({ href, children = "Tilbage", className }) {
  return (
    <Link href={href} className={className ? `${styles.back} ${className}` : styles.back}>
      <svg width="11.2852" height="15.5" viewBox="0 0 11.2852 15.5" aria-hidden="true" className={styles.icon}>
        <path d="M3.53516 7.75L11.2852 15.5H7.75L0 7.75L7.75 0H11.2852L3.53516 7.75Z" fill="currentColor" />
      </svg>
      {children}
    </Link>
  );
}
