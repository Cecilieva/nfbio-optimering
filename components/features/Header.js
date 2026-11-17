import Image from "next/image";
import Link from "next/link";
import { getSelectedCity } from "@/lib/data/cities";
import styles from "./Header.module.css";

// Figma: Header (node 455:9848). Variants: "m. alt" (default) and "Kun logo".
export default async function Header({ variant = "full" }) {
  const city = variant === "full" ? await getSelectedCity() : null;

  const logo = (
    <Link href="/" className={styles.logo} aria-label="Nordisk Film Biografer – forside">
      <Image src="/logo.svg" alt="" width={84.75} height={63.75} priority />
    </Link>
  );

  if (variant === "logo") {
    return (
      <header className={styles.header}>
        <div className={`${styles.bar} ${styles.barCentered}`}>{logo}</div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <nav className={styles.bar} aria-label="Hovedmenu">
        <div className={styles.start}>
          {/* TODO: open the menu once it exists */}
          <button type="button" className={styles.iconButton} aria-label="Menu">
            <Image src="/icons/menu.svg" alt="" width={24} height={24} />
          </button>
        </div>

        {logo}

        <ul className={styles.actions}>
          <li>
            {/* TODO: wire up search once it exists */}
            <button type="button" className={styles.iconButton} aria-label="Søg">
              <Image src="/icons/search.svg" alt="" width={24} height={24} />
            </button>
          </li>
          <li>
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
