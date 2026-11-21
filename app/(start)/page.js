import FormLoader from "@/components/features/FormLoader";
import Spotlight from "@/components/features/Spotlight";
import Button from "@/components/ui/Button";
import { selectCity } from "@/lib/actions/city";
import { getCities, getSelectedCity } from "@/lib/data/cities";
import { safePath } from "@/lib/safe-path";
import styles from "./page.module.css";

// Teksten, der står i browserens fane
export const metadata = {
  title: "Vælg by",
};

// Figma: "01 Vælg by".
// Det er den første skærm i flowet. Den vises på "/" og på "/by".
export default async function CityPage({ searchParams }) {
  // ?next= i URL'en fortæller, hvilken side vi skal videre til, når byen er valgt.
  // Eksempel: /by?next=/film/dune
  const { next } = await searchParams;

  // Hent alle byer fra databasen og den by, brugeren evt. har valgt før.
  // Promise.all kører begge hentninger på samme tid, så siden loader hurtigere.
  const [cities, selected] = await Promise.all([getCities(), getSelectedCity()]);

  // Mangler ?next=, eller peger den på en anden hjemmeside, går vi til filmoversigten i stedet.
  const nextPage = safePath(next, "/film");

  return (
    <main className={styles.scene}>
      {/* Den animerede lyskegle bag teksten */}
      <Spotlight />

      <div className={styles.content}>
        <h1 className={styles.title}>Hvor vil du i biografen?</h1>
        <p className={styles.subtitle}>Vælg din by – du kan altid skifte senere</p>

        <ul className={styles.cities}>
          {/* Én knap for hver by */}
          {cities.map((city) => (
            <li key={city.id}>
              {/* Hver by er sin egen lille formular. Når man klikker på knappen,
                  sendes formularen til server action'en selectCity, som gemmer byen. */}
              <form action={selectCity}>
                {/* Skjulte felter: de sendes med formularen, men vises ikke for brugeren */}
                <input type="hidden" name="city_id" value={city.id} />
                <input type="hidden" name="next" value={nextPage} />

                {/* aria-current markerer den by, der allerede er valgt,
                    så den får en tydeligere kant (se Button.module.css) */}
                <Button
                  type="submit"
                  variant="tile"
                  aria-current={city.id === selected?.id ? "true" : undefined}
                >
                  {city.name}
                </Button>
                {/* Viser "Indlæser", mens formularen sendes */}
                <FormLoader />
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
