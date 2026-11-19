import { cache } from "react";
import { getTicketSaleOpens } from "@/lib/data/ticket-sale";
import { formatDayKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// The columns a MovieCard needs
const CARD_COLUMNS = "id, title, slug, poster_url, age_rating, duration_min, genres, premiere_date";

// Films showing now that have coming showtimes in the city.
// showtimes!inner keeps only films with a matching showtime.
// Each film keeps its coming showtimes as { starts_at, format, cinema_id } – the filter on /film uses them
// to find films by cinema, date and format.
export async function getNowPlaying(cityId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select(
      `${CARD_COLUMNS}, language, showtimes!inner(starts_at, format, hall:halls!inner(cinema:cinemas!inner(id, city_id)))`,
    )
    .eq("status", "now_playing")
    .eq("showtimes.hall.cinema.city_id", cityId)
    .gte("showtimes.starts_at", new Date().toISOString())
    .order("title");

  if (error) {
    throw error;
  }

  return data.map(({ showtimes, ...movie }) => ({
    ...movie,
    // Some genres from TMDB end with a space, e.g. "Historie "
    genres: movie.genres?.map((genre) => genre.trim()),
    showtimes: showtimes.map((showtime) => ({
      starts_at: showtime.starts_at,
      format: showtime.format,
      cinema_id: showtime.hall.cinema.id,
    })),
  }));
}

// Posters for coming films that have none in the database. The images are already in the project.
const POSTER_FALLBACKS = {
  "sunrise-on-the-reaping": "/intro/plakater/sunrise.jpg",
};

// One row per title. The database has "SORT – En film af Ukendt Kunstner" twice (one without a poster),
// so we keep the first row with a poster – or the first row, if none has one.
function uniqueByTitle(movies) {
  const byTitle = new Map();
  for (const movie of movies) {
    const kept = byTitle.get(movie.title);
    if (!kept || (!kept.poster_url && movie.poster_url)) {
      byTitle.set(movie.title, movie);
    }
  }
  return movies.filter((movie) => byTitle.get(movie.title) === movie);
}

// Films coming soon. They have no showtimes yet, so the city does not matter.
// Each film also gets ticket_sale_opens (a date or null) and ticket_sale_open (true when tickets can be bought now).
export async function getComingSoon() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select(CARD_COLUMNS)
    .eq("status", "coming_soon")
    .order("premiere_date", { ascending: true, nullsFirst: false })
    .order("title");

  if (error) {
    throw error;
  }

  const today = formatDayKey(new Date());

  return uniqueByTitle(data).map((movie) => {
    const opens = getTicketSaleOpens(movie.slug);
    return {
      ...movie,
      poster_url: movie.poster_url ?? POSTER_FALLBACKS[movie.slug] ?? null,
      ticket_sale_opens: opens,
      ticket_sale_open: !opens || opens <= today,
    };
  });
}

// Genrerne, der giver en kommende film det mørke tema på filmsiden (REC, lommelygten og den smeltende titel).
// Med små bogstaver, så "Thriller" og "thriller" tæller ens.
const CASE_GENRES = ["thriller", "gyser"];

// One film by its slug, or null if there is none.
// cache() makes the page and generateMetadata share one request.
// Filmen får også to ekstra værdier til toppen af filmsiden (MovieHero):
//   before_premiere – true for en kommende film, hvis premiere ikke er nået endnu (viser nedtællingen)
//   case_genre      – "Thriller" eller "Gyser", når det er den første genre på en kommende film, ellers null
export const getMovieBySlug = cache(async (slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("movies").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  // Ingen film med den slug → null, så siden kan vise 404
  if (!data) {
    return null;
  }

  // Nogle genrer fra TMDB slutter med et mellemrum, fx "Historie " – trim() fjerner det
  const genres = data.genres?.map((genre) => genre.trim());
  // "coming_soon" er status for kommende film i databasen
  const isComing = data.status === "coming_soon";
  // Kun den første genre tæller (?. = undgå fejl, hvis filmen ingen genrer har)
  const first = genres?.[0];

  return {
    // ...data kopierer alle felterne fra databasen, og felterne nedenfor lægges oveni
    ...data,
    genres,
    // Datoerne er tekst som "2026-12-20" i dansk tid, så de kan sammenlignes direkte: "2026-12-20" > "2026-11-19"
    // formatDayKey(new Date()) er dagens dato i samme form
    before_premiere: isComing && data.premiere_date > formatDayKey(new Date()),
    // Kommende film + første genre er thriller/gyser → genren (fx "Thriller"), ellers null
    case_genre: isComing && CASE_GENRES.includes(first?.toLowerCase()) ? first : null,
  };
});
