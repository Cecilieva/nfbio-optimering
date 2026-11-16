import Button from "@/components/ui/Button";
import { selectCity } from "@/lib/actions/city";
import { getCities, getSelectedCity } from "@/lib/data/cities";
import { safePath } from "@/lib/safe-path";

export const metadata = {
  title: "Vælg by",
};

// Figma: "Vælg by". ?next= is the page to go back to afterwards.
export default async function CityPage({ searchParams }) {
  const { next } = await searchParams;
  const [cities, selected] = await Promise.all([getCities(), getSelectedCity()]);

  return (
    <main>
      <h1>Vælg by</h1>
      <ul>
        {cities.map((city) => (
          <li key={city.id}>
            <form action={selectCity}>
              <input type="hidden" name="city_id" value={city.id} />
              <input type="hidden" name="next" value={safePath(next, "/")} />
              <Button type="submit" variant={city.id === selected?.id ? "primary" : "secondary"}>
                {city.name}
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
