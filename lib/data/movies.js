import { cache } from "react";
import { getTicketSaleOpens } from "@/lib/data/ticket-sale";
import { formatDayKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const CARD_COLUMNS = "id, title, slug, poster_url, age_rating, duration_min, genres, premiere_date";

// Film, der kører nu i byen. showtimes!inner = kun film med mindst én spilletid
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
    genres: movie.genres?.map((genre) => genre.trim()),
    showtimes: showtimes.map((showtime) => ({
      starts_at: showtime.starts_at,
      format: showtime.format,
      cinema_id: showtime.hall.cinema.id,
    })),
  }));
}

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
      ticket_sale_opens: opens,
      ticket_sale_open: !opens || opens <= today,
    };
  });
}

// Filmene, man kan søge efter i headeren: dem der kører nu og de kommende (samme regel som getComingSoon).
// Kun de felter, søgningen viser, så listen er let at sende med til browseren.
// cache() = hentes kun én gang pr. side, selvom headeren beder om den
export const getSearchMovies = cache(async () => {
  const today = formatDayKey(new Date());
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select("id, title, slug, poster_url, status")
    .or(`status.eq.now_playing,and(status.eq.coming_soon,premiere_date.gt.${today})`)
    .order("title");

  if (error) {
    throw error;
  }

  return uniqueByTitle(data).map((movie) => ({
    id: movie.id,
    title: movie.title,
    slug: movie.slug,
    poster_url: movie.poster_url,
    comingSoon: movie.status === "coming_soon",
  }));
});

// genrer, der giver det mørke tema
const CASE_GENRES = ["thriller", "gyser"];

// Kampagne-animationer – kun disse to film. Alle andre får standard
const CLAYFACE_SLUG = "clayface";
const KATTEN_SLUG = "katten-med-hatten";

// Én film ud fra slug, eller null. cache() = hentes kun én gang pr. side
export const getMovieBySlug = cache(async (slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("movies").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  // nogle genrer fra TMDB har mellemrum til sidst
  const genres = data.genres?.map((genre) => genre.trim());
  const isComing = data.status === "coming_soon";
  const first = genres?.[0];
  const saleOpens = isComing ? getTicketSaleOpens(data.premiere_date) : null;

  return {
    ...data,
    genres,
    // datoer er tekst → kan sammenlignes direkte
    before_premiere: isComing && data.premiere_date > formatDayKey(new Date()),
    ticket_sale_opens: saleOpens,
    ticket_sale_open: !saleOpens || saleOpens <= formatDayKey(new Date()),
    case_genre: data.slug === CLAYFACE_SLUG ? first : null,
    title_variant: getTitleVariant(data.slug),
    theme: getTheme(isComing, genres),
  };
});

function getTitleVariant(slug) {
  if (slug === CLAYFACE_SLUG) {
    return "clayface";
  }
  if (slug === KATTEN_SLUG) {
    return "katten";
  }
  return "standard";
}

// farve-mode til filmsiden – kun kommende film. thriller vinder over familie
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
