import Spotlight from "@/components/features/city-picker/Spotlight";
import CinemaFinder from "@/components/features/cinemas/CinemaFinder";
import { REGIONS, getAllCinemas } from "@/lib/data/cinemas";
import { getCities } from "@/lib/data/cities";
import styles from "./page.module.css";

// Teksten, der står i browserens fane
export const metadata = {
  title: "Find din biograf",
};

// /biografer – Figma: "Biograf oversigt" ("Find din biograf").
// Alle biografer i landet, grupperet efter landsdel. Man kan søge efter by, bruge sin placering eller vælge en by.
export default async function CinemasPage() {
  const [cinemas, cities] = await Promise.all([getAllCinemas(), getCities()]);

  return (
    <main id="indhold" className={styles.page}>
      {/* Figma "Scene": lyskeglen bag overskriften, søgningen og byerne */}
      <div className={styles.scene}>
        <Spotlight />
        <div className={styles.intro}>
          <h1 className={styles.title}>Find din biograf</h1>
          <p className={styles.subtitle}>{cinemas.length} Nordisk Film biografer i hele landet</p>
        </div>

        <CinemaFinder cities={cities} cinemas={cinemas} regions={REGIONS} />
      </div>
    </main>
  );
}
