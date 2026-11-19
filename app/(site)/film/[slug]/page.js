import { notFound, redirect } from "next/navigation";
import MovieHero from "@/components/features/MovieHero";
import ShowtimeList from "@/components/features/ShowtimeList";
import DataDump from "@/components/ui/DataDump";
import { getSelectedCity } from "@/lib/data/cities";
import { getMovieBySlug } from "@/lib/data/movies";
import { getShowtimes } from "@/lib/data/showtimes";
import { formatDay, formatDuration } from "@/lib/format";
import styles from "./page.module.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  return {
    title: movie ? movie.title : "Filmen blev ikke fundet",
  };
}

// Figma: "Filmside" – MovieHero øverst (billede, titel, trailer, følg, køb), derefter fakta og spilletider
export default async function MoviePage({ params }) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const city = await getSelectedCity();

  if (!city) {
    redirect(`/by?next=/film/${slug}`);
  }

  const showtimes = await getShowtimes(movie.id, city.id);

  // Only the facts the film has a value for
  const facts = [
    ["Instruktør", movie.director],
    ["Medvirkende", movie.cast_members?.join(", ")],
    ["Genrer", movie.genres?.join(", ")],
    ["Sprog", movie.language],
    ["Censur", movie.age_rating],
    ["Længde", formatDuration(movie.duration_min)],
    ["Premiere", movie.premiere_date && formatDay(movie.premiere_date)],
  ].filter(([, value]) => value);

  return (
    <main className={styles.page}>
      <MovieHero movie={movie} />

      {/* Ikke stylet fra Figma endnu */}
      <div className={styles.content}>
        {(movie.description || movie.short_description) && (
          <p>{movie.description || movie.short_description}</p>
        )}

        <dl>
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {/* id="spilletider" er det sted, "Køb billet" i MovieHero hopper ned til (#spilletider) */}
        <h2 id="spilletider">Spilletider i {city.name}</h2>
        <ShowtimeList showtimes={showtimes} />

        <DataDump label="movie, showtimes" data={{ movie, showtimes }} />
      </div>
    </main>
  );
}
