import { cache } from "react";
import { formatDayKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// Er 20 % eller færre af pladserne ledige, viser vi "Få pladser" (gul prik)
const FEW_SEATS_SHARE = 0.2;

// Supabase sender højst 1000 rækker pr. svar. Har en film mange forestillinger og mange solgte sæder,
// er der langt flere – så de hentes 1000 ad gangen, indtil der ikke er flere.
const PAGE_SIZE = 1000;

// Så mange id'er sendes med i ét .in(...) – ellers bliver adressen for lang
const IDS_PER_REQUEST = 200;

// Henter alle rækker fra en forespørgsel, side for side. makeQuery laver forespørgslen forfra hver gang
// (den skal være sorteret, så siderne ikke overlapper).
async function fetchAll(makeQuery) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await makeQuery().range(from, from + PAGE_SIZE - 1);
    if (error) {
      throw error;
    }
    rows.push(...data);
    if (data.length < PAGE_SIZE) {
      return rows;
    }
  }
}

// Deler en liste op i bidder, fx [1..450] -> [1..200], [201..400], [401..450]
function chunk(list, size) {
  const chunks = [];
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
}

// Henter filmens kommende spilletider i den valgte by, med sal og biograf.
// Hver spilletid får også fire ting mere med:
//   day            – dagen, fx "2026-11-26"
//   free_seats     – antal ledige pladser
//   seat_status    - "available" (grøn), "few" (gul) eller "sold_out" (rød)
//   taken_seat_ids - id'erne på de sæder, der er taget (til "Se salen")
export async function getShowtimes(movieId, cityId) {
  const supabase = await createClient();
  const data = await fetchAll(() =>
    supabase
      .from("showtimes")
      .select(
        "id, starts_at, format, price_dkk, hall_id, hall:halls!inner(name, cinema:cinemas!inner(id, name, slug, city_id))",
      )
      .eq("movie_id", movieId)
      .eq("hall.cinema.city_id", cityId)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .order("id"),
  );

  // Ingen spilletider -> så er vi færdige
  if (data.length === 0) {
    return [];
  }

  // 1) Tæl, hvor mange sæder der er i hver sal (hver sal kun én gang)
  const hallIds = [...new Set(data.map((showtime) => showtime.hall_id))];
  const seats = await fetchAll(() => supabase.from("seats").select("hall_id").in("hall_id", hallIds).order("id"));

  // Fx { 6: 96, 16: 44 } = sal 6 har 96 sæder, sal 16 har 44
  const seatsPerHall = {};
  for (const seat of seats) {
    seatsPerHall[seat.hall_id] = (seatsPerHall[seat.hall_id] ?? 0) + 1;
  }

  // 2) Hent de sæder, der er taget (købt eller reserveret lige nu) – for IDS_PER_REQUEST forestillinger ad gangen
  const showtimeIds = data.map((showtime) => showtime.id);
  const takenChunks = await Promise.all(
    chunk(showtimeIds, IDS_PER_REQUEST).map((ids) =>
      fetchAll(() =>
        supabase
          .from("taken_seats")
          .select("showtime_id, seat_id")
          .in("showtime_id", ids)
          .order("showtime_id")
          .order("seat_id"),
      ),
    ),
  );
  const taken = takenChunks.flat();

  // De tagne sæder samlet pr. forestilling, fx { 812: [4, 5, 9] }
  const takenByShowtime = {};
  for (const row of taken) {
    (takenByShowtime[row.showtime_id] ??= []).push(row.seat_id);
  }

  // 3) Regn ud, hvor mange pladser der er ledige, og hvilken farve prikken skal have
  return data.map((showtime) => {
    // De sæder, der er taget til lige præcis denne forestilling (bruges også i "Se salen")
    const takenSeatIds = takenByShowtime[showtime.id] ?? [];
    const total = seatsPerHall[showtime.hall_id] ?? 0;
    const free = total - takenSeatIds.length;

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
      taken_seat_ids: takenSeatIds,
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
