import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// The film's coming showtimes in the city, with the hall and cinema they are in.
export async function getShowtimes(movieId, cityId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("showtimes")
    .select("id, starts_at, format, price_dkk, hall:halls!inner(name, cinema:cinemas!inner(name, slug, city_id))")
    .eq("movie_id", movieId)
    .eq("hall.cinema.city_id", cityId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  if (error) {
    throw error;
  }

  return data;
}

// One showtime with its film, hall and cinema, or null.
// Used by the seat page and every booking page.
export const getShowtime = cache(async (showtimeId) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("showtimes")
    .select(
      "id, starts_at, format, price_dkk, hall_id, movie:movies(id, title, slug, poster_url, age_rating, duration_min), hall:halls(name, cinema:cinemas(name, slug, address))",
    )
    .eq("id", showtimeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
});
