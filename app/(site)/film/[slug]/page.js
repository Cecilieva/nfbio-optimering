import { notFound, redirect } from "next/navigation";
import MovieDetails from "@/components/features/MovieDetails";
import MovieHero from "@/components/features/MovieHero";
import ShowtimeList from "@/components/features/showtimes/ShowtimeList";
import { getCurrentUser } from "@/lib/auth";
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

  const [showtimes, user] = await Promise.all([getShowtimes(movie.id, city.id), getCurrentUser()]);

  // Ikke logget ind: "Følg film" sender en til login
  const loginHref = user ? undefined : `/login?next=/film/${slug}`;

  // til "Se salen"
  const halls = await getHallLayouts(showtimes.map((showtime) => showtime.hall_id));

  return (
    // data-theme: "thriller", "familie" eller ingenting (farverne står nederst i tokens.css)
    // data-hero-under-header: headeren ligger gennemsigtig oven på heroen
    <main className={styles.page} data-theme={movie.theme ?? undefined} data-hero-under-header>
      <MovieHero movie={movie} loginHref={loginHref} />

      <MovieDetails movie={movie} />

      <div className={styles.content}>
        <ShowtimeList movie={movie} showtimes={showtimes} halls={halls} />
      </div>
    </main>
  );
}
