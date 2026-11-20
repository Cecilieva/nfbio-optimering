import { notFound, redirect } from "next/navigation";
import MovieDetails from "@/components/features/MovieDetails";
import MovieHero from "@/components/features/MovieHero";
import ScrollToShowtimes from "@/components/features/showtimes/ScrollToShowtimes";
import ShowtimeList from "@/components/features/showtimes/ShowtimeList";
import { getSelectedCity } from "@/lib/data/cities";
import { getMovieBySlug } from "@/lib/data/movies";
import { getHallLayouts } from "@/lib/data/seats";
import { getShowtimes } from "@/lib/data/showtimes";
import styles from "./page.module.css";

// Teksten i browserens fane
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  return {
    title: movie ? movie.title : "Filmen blev ikke fundet",
  };
}

// Filmsiden (Figma "Filmside")
export default async function MoviePage({ params }) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const city = await getSelectedCity();

  // ?next= sender brugeren tilbage til filmen bagefter
  if (!city) {
    redirect(`/by?next=/film/${slug}`);
  }

  const showtimes = await getShowtimes(movie.id, city.id);

  // til "Se salen"
  const halls = await getHallLayouts(showtimes.map((showtime) => showtime.hall_id));

  return (
    // data-theme: "thriller", "familie" eller ingenting (farverne står nederst i tokens.css)
    // data-hero-under-header: headeren ligger gennemsigtig oven på heroen
    <main className={styles.page} data-theme={movie.theme ?? undefined} data-hero-under-header>
      <MovieHero movie={movie} />

      <MovieDetails movie={movie} />

      <div className={styles.content}>
        <ShowtimeList movie={movie} showtimes={showtimes} halls={halls} />
      </div>

      <ScrollToShowtimes />
    </main>
  );
}
