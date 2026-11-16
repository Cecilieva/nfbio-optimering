import Link from "next/link";
import AuthStatus from "@/components/features/AuthStatus";
import { getSelectedCity } from "@/lib/data/cities";
import styles from "./Header.module.css";

export default async function Header() {
  const city = await getSelectedCity();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          Nordisk Film Biograf
        </Link>
        <ul className={styles.links}>
          <li>
            <Link href="/by">{city ? city.name : "Vælg by"}</Link>
          </li>
          <li>
            <Link href="/profile">Profil</Link>
          </li>
        </ul>
        <AuthStatus />
      </nav>
    </header>
  );
}
