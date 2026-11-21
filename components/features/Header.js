import Image from "next/image";
import Link from "next/link";
import { getCities, getSelectedCity } from "@/lib/data/cities";
import CityMenu from "./CityMenu";
import MainMenu from "./MainMenu";
import ScrollHeader from "./ScrollHeader";
import styles from "./Header.module.css";

// Figma: Header (258:5371). Den findes i to udgaver (varianter):
//   variant="full" (standard) – burgermenu, logo, søg, by og profil. Bruges på de fleste sider.
//   variant="logo"            – kun logoet i midten. Bruges på Vælg by.
// Headeren gemmer sig, når man scroller ned, og kommer frem igen, når man scroller op (ScrollHeader).
export default async function Header({ variant = "full" }) {
  // Det er kun den fulde header, der bruger byen, så vi henter den kun dér
  // (og listen over byer til byskiftet)
  let city = null;
  let cities = [];
  if (variant === "full") {
    [city, cities] = await Promise.all([getSelectedCity(), getCities()]);
  }

  // Hvor logoet linker hen: til filmoversigten, eller tilbage til Vælg by på startskærmen
  const logoLink = variant === "full" ? "/film" : "/";

  // Logoet bruges i begge udgaver, så vi laver det én gang og genbruger det
  const logo = (
    <Link href={logoLink} className={styles.logo} aria-label="Nordisk Film Biografer – forside">
      {/* alt="" fordi linket allerede har en tekst (aria-label) til skærmlæsere.
          Størrelsen er fra Figma: 56px høj (samme form som logoet i menuen og footeren, bare mindre) */}
      <Image src="/logo.svg" alt="" width={74.45} height={56} priority />
    </Link>
  );

  // Udgave 1: kun logoet, centreret
  if (variant === "logo") {
    return (
      <ScrollHeader className={styles.header}>
        <div className={`${styles.bar} ${styles.barCentered}`}>{logo}</div>
      </ScrollHeader>
    );
  }

  // Udgave 2: den fulde header
  return (
    <ScrollHeader className={styles.header}>
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
            {/* Åbner byskiftet (Figma "Byskift"), hvor man vælger en anden by */}
            <CityMenu cities={cities} city={city} triggerClassName={styles.iconButton} />
          </li>
          <li>
            <Link href="/profile" className={styles.iconButton} aria-label="Profil">
              <Image src="/icons/profile.svg" alt="" width={24} height={24} />
            </Link>
          </li>
        </ul>
      </nav>
    </ScrollHeader>
  );
}
