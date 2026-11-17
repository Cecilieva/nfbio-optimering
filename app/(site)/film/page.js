import { redirect } from "next/navigation";
import MovieCard from "@/components/features/MovieCard";
import DataDump from "@/components/ui/DataDump";
import { getSelectedCity } from "@/lib/data/cities";
import { getComingSoon, getNowPlaying } from "@/lib/data/movies";

// /film – Figma: "Forside" – films showing now in the city, and films coming soon
export default async function HomePage() {
  const city = await getSelectedCity();

  if (!city) {
    redirect("/");
  }

  const [nowPlaying, comingSoon] = await Promise.all([getNowPlaying(city.id), getComingSoon()]);

  return (
    <main>
      <h1>Film i {city.name}</h1>

      <h2>Spiller nu</h2>
      {nowPlaying.length === 0 && <p>Der går ingen film i {city.name} lige nu.</p>}
      <ul>
        {nowPlaying.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>

      <h2>Kommer snart</h2>
      {comingSoon.length === 0 && <p>Der er ingen kommende film lige nu.</p>}
      <ul>
        {comingSoon.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>

      <DataDump label="nowPlaying, comingSoon" data={{ city, nowPlaying, comingSoon }} />
    </main>
  );
}
