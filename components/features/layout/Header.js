import Image from "next/image";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import LinkLoader from "@/components/features/loading/LinkLoader";
import { getCities, getSelectedCity } from "@/lib/data/cities";
import { getSearchMovies } from "@/lib/data/movies";
import CityMenu from "./CityMenu";
import HeaderSearch from "./HeaderSearch";
import MainMenu from "./MainMenu";
import ScrollHeader from "./ScrollHeader";
import styles from "./Header.module.css";

// Headeren. Gemmer sig, når man scroller ned, og kommer frem, når man scroller op.
//
//   variant="full" - burgermenu, logo, søg, by og profil (standard)
//   variant="logo" - kun logoet, fx på Vælg by
export default async function Header({ variant = "full" }) {
  // Kun den fulde header skal bruge byen, byerne og filmene til søgningen
  let city = null;
  let cities = [];
  let searchMovies = [];
  if (variant === "full") {
    try {
      // Byen hentes først, fordi søgningen kun viser film i byen
      city = await getSelectedCity();
      [cities, searchMovies] = await Promise.all([getCities(), getSearchMovies(city?.id)]);
    } catch (error) {
      // Next.js' egne signaler (fx fra cookies()) sendes videre – vi fanger kun rigtige fejl
      unstable_rethrow(error);

      // Svarer databasen ikke, vises headeren alligevel – bare uden byer og film.
      // Ellers ville fejlsiden også miste headeren
      console.error("Header: kunne ikke hente byer og film –", error.message);
    }
  }

  // Logoet linker til /film – eller til Vælg by på startskærmen
  const logoLink = variant === "full" ? "/film" : "/";

  // Logoet bruges i begge udgaver
  const logo = (
    <Link href={logoLink} className={styles.logo} aria-label="Nordisk Film Biografer – forside">
      {/* alt="", fordi linket har en aria-label. 56px højt */}
      <Image src="/logo.svg" alt="" width={74} height={56} priority />
      <LinkLoader />
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
        {/* Venstre: burgermenuen */}
        <div className={styles.start}>
          <MainMenu triggerClassName={styles.iconButton} />
        </div>

        {/* Midten: logoet */}
        {logo}

        {/* Højre: søg, by og profil */}
        <ul className={styles.actions}>
          <li>
            {/* Søg efter film */}
            <HeaderSearch movies={searchMovies} triggerClassName={styles.iconButton} />
          </li>
          <li>
            {/* Vælg en anden by */}
            <CityMenu cities={cities} city={city} triggerClassName={styles.iconButton} />
          </li>
          <li>
            <Link href="/profile" className={styles.iconButton} aria-label="Profil">
              <Image src="/icons/profile.svg" alt="" width={24} height={24} />
              <LinkLoader />
            </Link>
          </li>
        </ul>
      </nav>
    </ScrollHeader>
  );
}
