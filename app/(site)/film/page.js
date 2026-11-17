import { redirect } from "next/navigation";
import FeaturedCarousel from "@/components/features/FeaturedCarousel";
import MovieCard from "@/components/features/MovieCard";
import DataDump from "@/components/ui/DataDump";
import { getSelectedCity } from "@/lib/data/cities";
import { getFeaturedMovies } from "@/lib/data/featured";
import { getComingSoon, getNowPlaying } from "@/lib/data/movies";
import styles from "./page.module.css";

// /film – Figma: "Forside" – films showing now in the city, and films coming soon
export default async function HomePage() {
  const city = await getSelectedCity();

  if (!city) {
    redirect("/");
  }

  const [nowPlaying, comingSoon, featured] = await Promise.all([
    getNowPlaying(city.id),
    getComingSoon(),
    getFeaturedMovies(),
  ]);

  return (
    <main className={styles.page}>
      {/* De fremhævede film skifter roligt. Intro-videoen ligger inde i karrusellen og ender på det første kort. */}
      <section className={styles.hero} aria-label="Kommer snart">
        <FeaturedCarousel movies={featured} />
      </section>

      <div className={styles.content}>
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

        <DataDump label="nowPlaying, comingSoon, featured" data={{ city, nowPlaying, comingSoon, featured }} />
      </div>
    </main>
  );
}
