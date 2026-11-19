import { notFound, redirect } from "next/navigation";
import MovieDetails from "@/components/features/MovieDetails";
import MovieHero from "@/components/features/MovieHero";
import ShowtimeList from "@/components/features/ShowtimeList";
import DataDump from "@/components/ui/DataDump";
import { getSelectedCity } from "@/lib/data/cities";
import { getMovieBySlug } from "@/lib/data/movies";
import { getShowtimes } from "@/lib/data/showtimes";
import styles from "./page.module.css";

// Sætter teksten i browserens fane, fx "Clayface".
// Findes filmen ikke, står der "Filmen blev ikke fundet".
export async function generateMetadata({ params }) {
  // slug = den sidste del af adressen, fx "clayface" i /film/clayface
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  return {
    title: movie ? movie.title : "Filmen blev ikke fundet",
  };
}

// Filmsiden (Figma "Filmside"). Rækkefølge på siden:
//   1. MovieHero    – det store billede med titel, fakta-bar og knapper
//   2. MovieDetails – plakat, handling og fakta
//   3. Spilletider  – ikke stylet fra Figma endnu
export default async function MoviePage({ params }) {
  // Find filmen ud fra adressen, fx /film/clayface → "clayface"
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  // Ingen film med den adresse -> vis 404-siden
  if (!movie) {
    notFound();
  }

  // Hvilken by har brugeren valgt? (gemt i en cookie)
  const city = await getSelectedCity();

  // Ingen by valgt → send brugeren til "Vælg by".
  // ?next= sørger for, at de kommer tilbage til denne film bagefter.
  if (!city) {
    redirect(`/by?next=/film/${slug}`);
  }

  // Filmens spilletider i den valgte by
  const showtimes = await getShowtimes(movie.id, city.id);

  return (
    // data-theme bestemmer farverne på hele siden:
    //   "thriller" = mørk (kommende thriller/gyser)
    //   "familie"  = lys creme (kommende familiefilm)
    //   ingenting  = standard (mørkeblå)
    // Farverne for hver mode står nederst i tokens.css
    <main className={styles.page} data-theme={movie.theme ?? undefined}>
      <MovieHero movie={movie} />

      {/* Figma "Filmdetaljer/Default": plakat, handling og fakta */}
      <MovieDetails movie={movie} />

      {/* Spilletiderne – mangler stadig styling fra Figma */}
      <div className={styles.content}>
        {/* id="spilletider": knappen "Køb billet" i toppen hopper herned */}
        <h2 id="spilletider">Spilletider i {city.name}</h2>
        <ShowtimeList showtimes={showtimes} />

        {/* Viser alle rå data nederst på siden – kun en hjælp, mens siden bygges. Fjernes når siden er færdig */}
        <DataDump label="movie, showtimes" data={{ movie, showtimes }} />
      </div>
    </main>
  );
}
