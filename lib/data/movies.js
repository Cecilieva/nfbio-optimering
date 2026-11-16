import { cache } from "react";
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

// Films coming soon. They have no showtimes yet, so the city does not matter.
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

  return data;
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
