import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import styles from "./Footer.module.css";

// Linkene i footeren. Når de står i lister, kan vi ændre dem her
// uden at røre HTML'en længere nede.
// TODO: peg pladsholder-linkene på rigtige sider, når de findes.
const CINEMA_LINKS = [
  { label: "Biografer", href: "/by" },
  { label: "Gavekort", href: "/film" },
  { label: "BIOPLUS", href: "/film" },
];

const HELP_LINKS = [
  { label: "Spørgsmål", href: "/film" },
  { label: "Kontakt", href: "/film" },
  { label: "Erhverv", href: "/film" },
];

const LEGAL_LINKS = [
  { label: "Privatliv og cookies", href: "/film" },
  { label: "Betingelser", href: "/film" },
];

// Vi linker til forsiderne af de sociale medier og ikke til en rigtig profil,
// fordi sitet er et studieprojekt uden tilknytning til Nordisk Film Biografer.
const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com", icon: "/icons/instagram.svg" },
  { label: "Facebook", href: "https://www.facebook.com", icon: "/icons/facebook.svg" },
  { label: "TikTok", href: "https://www.tiktok.com", icon: "/icons/tiktok.svg" },
];

/**
 * Figma: Footer, varianten "Generel".
 * Vises nederst på alle sider undtagen Vælg by.
 *
 * @param {object} props
 * @param {boolean} [props.showNewsletter=true] Vis tilmelding til nyhedsbrevet
 *   (Figma-egenskaben "Vis nyhedsbrev"). Kan slås fra, hvor den ikke passer ind.
 */
export default function Footer({ showNewsletter = true }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Øverst: logo, to kolonner med links og nyhedsbrevet */}
        <div className={styles.columns}>
          <div className={styles.logoColumn}>
            <Link href="/film" className={styles.logo} aria-label="Til forsiden">
              {/* alt="" fordi linket allerede har en tekst (aria-label) til skærmlæsere */}
              <Image src="/logo.svg" alt="" width={84.75} height={63.75} />
            </Link>
          </div>

          {/* Hver kolonne er sin egen <nav>, så skærmlæsere kan hoppe direkte til den */}
          <nav className={styles.column} aria-labelledby="footer-biograf">
            <h2 id="footer-biograf" className={styles.heading}>
              Biograf
            </h2>
            <ul className={styles.list}>
              {CINEMA_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-hjaelp">
            <h2 id="footer-hjaelp" className={styles.heading}>
              Hjælp
            </h2>
            <ul className={styles.list}>
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Nyhedsbrevet vises kun, hvis showNewsletter er true */}
          {showNewsletter && (
            <section className={styles.newsletter} aria-labelledby="footer-nyhedsbrev">
              <h2 id="footer-nyhedsbrev" className={styles.heading}>
                Nyhedsbrev
              </h2>
              <p className={styles.text}>Få premierer og forsalg først.</p>
              <NewsletterForm />
            </section>
          )}
        </div>

        <hr className={styles.divider} />

        {/* Nederst: copyright, juridiske links og sociale medier */}
        <div className={styles.bottom}>
          <div className={styles.legalGroup}>
            {/* Teksten viser tydeligt, at sitet er et studieprojekt og ikke Nordisk Films
                rigtige side. Det er et krav i projektbeskrivelsen.
                Den står på sin egen linje og er lysere end de juridiske links,
                så den ikke drukner i dem. */}
            <p className={styles.disclaimer}>
              © 2026 – studieprojekt uden tilknytning til Nordisk Film Biografer
            </p>

            {/* De juridiske links på linjen under, adskilt med en prik */}
            <p className={styles.legal}>
              {LEGAL_LINKS.map((link, index) => (
                <span key={link.label}>
                  {/* Prikken sættes kun ind før link nummer 2 og fremefter */}
                  {index > 0 && " · "}
                  <Link href={link.href} className={styles.legalLink}>
                    {link.label}
                  </Link>
                </span>
              ))}
            </p>
          </div>

          <ul className={styles.social}>
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                {/* aria-label giver ikon-linket et navn, fx "Instagram" */}
                <a href={link.href} className={styles.socialLink} aria-label={link.label}>
                  <Image src={link.icon} alt="" width={20} height={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
