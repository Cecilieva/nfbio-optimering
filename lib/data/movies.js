import { cache } from "react";
import { getTicketSaleOpens } from "@/lib/data/ticket-sale";
import { formatDayKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// De felter, et filmkort (MovieCard) skal bruge
const CARD_COLUMNS = "id, title, slug, poster_url, age_rating, duration_min, genres, premiere_date";

// Henter de film, der kører nu og har kommende spilletider i byen.
// showtimes!inner betyder: kun film, der har mindst én spilletid.
// Hver film får sine spilletider med – filteret på forsiden bruger dem til at finde film ud fra biograf, dato og format.
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
    // Nogle genrer fra TMDB har et mellemrum til sidst, fx "Historie " – det fjerner vi
    genres: movie.genres?.map((genre) => genre.trim()),
    showtimes: showtimes.map((showtime) => ({
      starts_at: showtime.starts_at,
      format: showtime.format,
      cinema_id: showtime.hall.cinema.id,
    })),
  }));
}

// Plakater til kommende film, der ikke har en plakat i databasen. Billederne ligger i projektet.
const POSTER_FALLBACKS = {
  "sunrise-on-the-reaping": "/intro/plakater/sunrise.jpg",
};

// Hver titel må kun stå én gang. Databasen har "SORT – En film af Ukendt Kunstner" to gange (den ene uden plakat),
// så vi beholder den med plakat – eller bare den første, hvis ingen af dem har en.
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

// Henter de kommende film. Byen er ligegyldig her.
// En film er kommende, når status er "coming_soon" OG premieren er efter i dag – samme regel for datoen
// som karrusellen øverst (lib/data/featured.js). Har en film forkert status i databasen, fx en premiere,
// der allerede har været, kommer den altså ikke med.
// Hver film får også:
//   ticket_sale_opens – datoen, hvor billetsalget åbner
//   ticket_sale_open  – true, hvis man kan købe billetter nu
export async function getComingSoon() {
  const today = formatDayKey(new Date());
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select(CARD_COLUMNS)
    .eq("status", "coming_soon")
    .gt("premiere_date", today)
    .order("premiere_date", { ascending: true })
    .order("title");

  if (error) {
    throw error;
  }

  return uniqueByTitle(data).map((movie) => {
    const opens = getTicketSaleOpens(movie.premiere_date);
    return {
      ...movie,
      poster_url: movie.poster_url ?? POSTER_FALLBACKS[movie.slug] ?? null,
      ticket_sale_opens: opens,
      ticket_sale_open: !opens || opens <= today,
    };
  });
}

// genrer der giver det mørke tema (REC, lommelygte, smeltende titel)
// små bogstaver så "Thriller" = "thriller"
const CASE_GENRES = ["thriller", "gyser"];

// Henter én film ud fra dens slug (fx "clayface"), eller null, hvis den ikke findes.
// cache() gør, at filmen kun hentes én gang, selvom siden spørger efter den to gange.
// ekstra felter til MovieHero:
//   before_premiere → kommende + premiere ikke nået endnu (nedtælling)
//   case_genre → "Thriller"/"Gyser" hvis det er 1. genre på en kommende film, ellers null
//   theme → "thriller", "familie" eller null (se getTheme)
export const getMovieBySlug = cache(async (slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("movies").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  // ingen film → null → 404
  if (!data) {
    return null;
  }

  // nogle genrer fra TMDB har mellemrum til sidst, fx "Historie "
  const genres = data.genres?.map((genre) => genre.trim());
  // kommende film = status "coming_soon"
  const isComing = data.status === "coming_soon";
  // kun 1. genre tæller (?. hvis der ingen genrer er)
  const first = genres?.[0];
  // Hvornår åbner billetsalget? Kun kommende film har en dato (7 dage før premieren)
  const saleOpens = isComing ? getTicketSaleOpens(data.premiere_date) : null;

  return {
    // alle felter fra databasen + de nye nedenfor
    ...data,
    genres,
    // datoer er tekst ("2026-12-20") → kan sammenlignes direkte med dagens dato
    before_premiere: isComing && data.premiere_date > formatDayKey(new Date()),
    // Er billetsalget åbent nu? Det er det altid for film, der allerede kører
    ticket_sale_opens: saleOpens,
    ticket_sale_open: !saleOpens || saleOpens <= formatDayKey(new Date()),
    case_genre: isComing && CASE_GENRES.includes(first?.toLowerCase()) ? first : null,
    theme: getTheme(isComing, genres),
  };
});

// mode til filmsiden – kun kommende film
// thriller/gyser som 1. genre vinder hvis en film også er familie
function getTheme(isComing, genres = []) {
  if (!isComing) {
    return null;
  }
  const lower = genres.map((genre) => genre.toLowerCase());
  if (CASE_GENRES.includes(lower[0])) {
    return "thriller";
  }
  if (lower.includes("familie")) {
    return "familie";
  }
  return null;
}
