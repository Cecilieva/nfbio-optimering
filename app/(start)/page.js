import Spotlight from "@/components/features/Spotlight";
import Button from "@/components/ui/Button";
import { selectCity } from "@/lib/actions/city";
import { getCities, getSelectedCity } from "@/lib/data/cities";
import { safePath } from "@/lib/safe-path";
import styles from "./page.module.css";

export const metadata = {
  title: "Vælg by",
};

// Figma: "01 Vælg by" (node 2141:155168). The start of the flow, shown at / and /by.
// ?next= is the page to go to afterwards (default: the film overview).
export default async function CityPage({ searchParams }) {
  const { next } = await searchParams;
  const [cities, selected] = await Promise.all([getCities(), getSelectedCity()]);

  return (
    <main className={styles.scene}>
      <Spotlight />

      <div className={styles.content}>
        <h1 className={styles.title}>Hvor vil du i biografen?</h1>
        <p className={styles.subtitle}>Vælg din by – du kan altid skifte senere</p>

        <ul className={styles.cities}>
          {cities.map((city) => (
            <li key={city.id}>
              <form action={selectCity}>
                <input type="hidden" name="city_id" value={city.id} />
                <input type="hidden" name="next" value={safePath(next, "/film")} />
                <Button
                  type="submit"
                  variant="tile"
                  aria-current={city.id === selected?.id ? "true" : undefined}
                >
                  {city.name}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
