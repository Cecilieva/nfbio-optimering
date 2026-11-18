import { cache } from "react";
import { getTicketSaleOpens } from "@/lib/data/ticket-sale";
import { formatDayKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// The columns a MovieCard needs
const CARD_COLUMNS = "id, title, slug, poster_url, age_rating, duration_min, genres, premiere_date";

// Films showing now that have coming showtimes in the city.
// showtimes!inner keeps only films with a matching showtime, and we drop the showtimes again.
export async function getNowPlaying(cityId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select(`${CARD_COLUMNS}, showtimes!inner(id, hall:halls!inner(cinema:cinemas!inner(city_id)))`)
    .eq("status", "now_playing")
    .eq("showtimes.hall.cinema.city_id", cityId)
    .gte("showtimes.starts_at", new Date().toISOString())
    .order("title");

  if (error) {
    throw error;
  }

  return data.map(({ showtimes, ...movie }) => movie);
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

// One film by its slug, or null if there is none.
// cache() makes the page and generateMetadata share one request.
export const getMovieBySlug = cache(async (slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("movies").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
});
