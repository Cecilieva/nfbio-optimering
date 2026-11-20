import Image from "next/image";
import Link from "next/link";
import { getSelectedCity } from "@/lib/data/cities";
import MainMenu from "./MainMenu";
import styles from "./Header.module.css";

// Figma: Header. Den findes i to udgaver (varianter):
//   variant="full" (standard) – burgermenu, logo, søg, by og profil. Bruges på de fleste sider.
//   variant="logo"            – kun logoet i midten. Bruges på Vælg by.
export default async function Header({ variant = "full" }) {
  // Det er kun den fulde header, der bruger byen, så vi henter den kun dér
  let city = null;
  if (variant === "full") {
    city = await getSelectedCity();
  }

  // Hvor logoet linker hen: til filmoversigten, eller tilbage til Vælg by på startskærmen
  const logoLink = variant === "full" ? "/film" : "/";

  // Logoet bruges i begge udgaver, så vi laver det én gang og genbruger det
  const logo = (
    <Link href={logoLink} className={styles.logo} aria-label="Nordisk Film Biografer – forside">
      {/* alt="" fordi linket allerede har en tekst (aria-label) til skærmlæsere */}
      <Image src="/logo.svg" alt="" width={84.75} height={63.75} priority />
    </Link>
  );

  // Udgave 1: kun logoet, centreret
  if (variant === "logo") {
    return (
      <header className={styles.header}>
        <div className={`${styles.bar} ${styles.barCentered}`}>{logo}</div>
      </header>
    );
  }

  // Udgave 2: den fulde header
  return (
    <header className={styles.header}>
      <nav className={styles.bar} aria-label="Hovedmenu">
        {/* Venstre: burgermenuen (åbner sidemenuen) */}
        <div className={styles.start}>
          <MainMenu triggerClassName={styles.iconButton} />
        </div>

        {/* Midten: logoet */}
        {logo}

        {/* Højre: ikoner for søg, by og profil */}
        <ul className={styles.actions}>
          <li>
            {/* TODO: få søgning til at virke, når søgesiden findes */}
            <button type="button" className={styles.iconButton} aria-label="Søg">
              <Image src="/icons/search.svg" alt="" width={24} height={24} />
            </button>
          </li>
          <li>
            {/* Går til Vælg by. Teksten fortæller skærmlæsere, hvilken by der er valgt. */}
            <Link
              href="/by"
              className={styles.iconButton}
              aria-label={city ? `By: ${city.name}. Skift by` : "Vælg by"}
            >
              <Image src="/icons/location.svg" alt="" width={24} height={24} />
            </Link>
          </li>
          <li>
            <Link href="/profile" className={styles.iconButton} aria-label="Profil">
              <Image src="/icons/profile.svg" alt="" width={24} height={24} />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
