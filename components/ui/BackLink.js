import Link from "next/link";
import LinkLoader from "@/components/features/LinkLoader";
import styles from "./BackLink.module.css";

/**
 * "Tilbage"-knappen. Figma: "Knap", Type=Tilbage.
 * Pil og tekst; ved hover bliver begge accent/Sekundær.
 * Pilen er SVG direkte i koden med currentColor, så den altid har samme farve som teksten.
 * Bruges øverst på filmsiden (MovieHero) og i bestillingsflowet (StepHeader).
 *
 * Med href er det et link. Med onClick er det en knap (fx tilbage til forrige fase på samme side).
 *
 * @param {object} props
 * @param {string} [props.href] Hvor linket fører hen
 * @param {() => void} [props.onClick] Bruges i stedet for href, når "Tilbage" ikke skifter side
 * @param {React.ReactNode} [props.children="Tilbage"] Teksten
 * @param {string} [props.className] Ekstra CSS-klasse fra forælderen
 */
export default function BackLink({ href, onClick, children = "Tilbage", className }) {
  const classes = className ? `${styles.back} ${className}` : styles.back;
  const content = (
    <>
      <svg width="11.2852" height="15.5" viewBox="0 0 11.2852 15.5" aria-hidden="true" className={styles.icon}>
        <path d="M3.53516 7.75L11.2852 15.5H7.75L0 7.75L7.75 0H11.2852L3.53516 7.75Z" fill="currentColor" />
      </svg>
      {children}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
      {/* Viser "Indlæser", hvis den næste side er længe om at komme (fx på langsomt net) */}
      <LinkLoader />
    </Link>
  );
}
