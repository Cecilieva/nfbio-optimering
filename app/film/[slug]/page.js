import { notFound, redirect } from "next/navigation";
import PosterPlaceholder from "@/components/features/PosterPlaceholder";
import ShowtimeList from "@/components/features/ShowtimeList";
import TrailerButton from "@/components/features/TrailerButton";
import DataDump from "@/components/ui/DataDump";
import { getSelectedCity } from "@/lib/data/cities";
import { getMovieBySlug } from "@/lib/data/movies";
import { getShowtimes } from "@/lib/data/showtimes";
import { formatDay, formatDuration } from "@/lib/format";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  return {
    title: movie ? movie.title : "Filmen blev ikke fundet",
  };
}

// Figma: "Filmside" – facts, trailer modal and showtimes in the chosen city
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
    <main>
      {movie.poster_url ? (
        <img src={movie.poster_url} alt="" />
      ) : (
        <PosterPlaceholder title={movie.title} />
      )}
      <h1>{movie.title}</h1>
      {movie.tagline && <p>{movie.tagline}</p>}
      {(movie.description || movie.short_description) && (
        <p>{movie.description || movie.short_description}</p>
      )}
      {movie.trailer_url && <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} />}

      <dl>
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <h2>Spilletider i {city.name}</h2>
      <ShowtimeList showtimes={showtimes} />

      <DataDump label="movie, showtimes" data={{ movie, showtimes }} />
    </main>
  );
}
