import { cache } from "react";
import { formatDayKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// Er 20 % eller færre af pladserne ledige, viser vi "Få pladser" (gul prik)
const FEW_SEATS_SHARE = 0.2;

// Henter filmens kommende spilletider i den valgte by – med sal og biograf.
// Vi lægger tre ting til hver spilletid:
//   day         – dagen, fx "2026-11-26"
//   free_seats  – antal ledige pladser
//   seat_status – "available" (grøn), "few" (gul) eller "sold_out" (rød)
export async function getShowtimes(movieId, cityId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("showtimes")
    .select(
      "id, starts_at, format, price_dkk, hall_id, hall:halls!inner(name, cinema:cinemas!inner(id, name, slug, city_id))",
    )
    .eq("movie_id", movieId)
    .eq("hall.cinema.city_id", cityId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  if (error) {
    throw error;
  }

  if (data.length === 0) {
    return [];
  }

  // 1) Tæl, hvor mange sæder der er i hver sal
  const seatsPerHall = {};
  for (const showtime of data) {
    // Har vi allerede talt sæderne i den sal, går vi videre til næste
    if (seatsPerHall[showtime.hall_id] !== undefined) {
      continue;
    }

    const { count, error: countError } = await supabase
      .from("seats")
      .select("id", { count: "exact", head: true })
      .eq("hall_id", showtime.hall_id);

    if (countError) {
      throw countError;
    }

    seatsPerHall[showtime.hall_id] = count;
  }

  // 2) Hent de sæder, der er taget (købt eller reserveret lige nu)
  const showtimeIds = data.map((showtime) => showtime.id);
  const { data: taken, error: takenError } = await supabase
    .from("taken_seats")
    .select("showtime_id")
    .in("showtime_id", showtimeIds);

  if (takenError) {
    throw takenError;
  }

  // 3) Regn ud, hvor mange pladser der er ledige, og hvilken farve prikken skal have
  return data.map((showtime) => {
    // Hvor mange sæder er taget til netop denne forestilling?
    const takenCount = taken.filter((row) => row.showtime_id === showtime.id).length;
    const total = seatsPerHall[showtime.hall_id];
    const free = total - takenCount;

    let seatStatus = "available"; // grøn
    if (free <= 0) {
      seatStatus = "sold_out"; // rød
    } else if (free <= total * FEW_SEATS_SHARE) {
      seatStatus = "few"; // gul
    }

    return {
      ...showtime,
      day: formatDayKey(showtime.starts_at),
      free_seats: free,
      seat_status: seatStatus,
    };
  });
}

// Henter én spilletid med film, sal og biograf (eller null, hvis den ikke findes).
// Bruges af sædevalget og alle siderne i købsflowet.
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
