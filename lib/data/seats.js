import { createClient } from "@/lib/supabase/server";

// Henter alle sæderne i salen til en forestilling, delt op i rækker.
// Hvert sæde får taken: true/false, alt efter om det er købt eller reserveret.
// Giver fx [{ number: 4, seats: [{ id, row_number, seat_number, col, type, taken }] }]
export async function getSeatMap(showtime) {
  const supabase = await createClient();

  // Henter sæderne og de optagne sæder på samme tid
  const [seatsResult, takenResult] = await Promise.all([
    supabase
      .from("seats")
      .select("id, row_number, seat_number, col, type")
      .eq("hall_id", showtime.hall_id)
      .order("row_number")
      .order("seat_number"),
    supabase.from("taken_seats").select("seat_id").eq("showtime_id", showtime.id),
  ]);

  if (seatsResult.error) {
    throw seatsResult.error;
  }

  if (takenResult.error) {
    throw takenResult.error;
  }

  // Id'erne på de optagne sæder
  const takenIds = new Set(takenResult.data.map((row) => row.seat_id));
  const rows = new Map();

  // Sorterer sæderne ud i rækker
  for (const seat of seatsResult.data) {
    if (!rows.has(seat.row_number)) {
      rows.set(seat.row_number, { number: seat.row_number, seats: [] });
    }

    rows.get(seat.row_number).seats.push({ ...seat, taken: takenIds.has(seat.id) });
  }

  return [...rows.values()];
}

// Henter de sæder, man har valgt (ud fra deres id), fx til ordreoversigten
export async function getSeatsByIds(seatIds) {
  // Ingen sæder valgt -> ingenting at hente
  if (!seatIds?.length) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seats")
    .select("id, row_number, seat_number, type")
    .in("id", seatIds);

  if (error) {
    throw error;
  }

  return data;
}

// Henter, hvordan salene ser ud, til "Se salen" på filmsiden - alle salene på én gang.
// Giver et objekt, hvor salens id er nøglen:
//   { 12: { columns: 16, rows: [{ number: 1, seats: [...] }] } }
// columns er, hvor mange kolonner salen er bred (gangene tæller med)
export async function getHallLayouts(hallIds) {
  // Ingen sale -> ingenting at hente
  if (hallIds.length === 0) {
    return {};
  }

  // Henter sæderne sorteret efter række og kolonne
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seats")
    .select("id, hall_id, row_number, seat_number, col, type")
    .in("hall_id", hallIds)
    .order("row_number")
    .order("col");

  if (error) {
    throw error;
  }

  const halls = {};
  for (const seat of data) {
    // Første sæde i en sal -> lav salen
    if (!halls[seat.hall_id]) {
      halls[seat.hall_id] = { columns: 0, rows: [] };
    }
    const hall = halls[seat.hall_id];

    // Sæderne kommer række for række, så når rækkenummeret skifter, laver vi en ny række
    let row = hall.rows[hall.rows.length - 1];
    if (!row || row.number !== seat.row_number) {
      row = { number: seat.row_number, seats: [] };
      hall.rows.push(row);
    }

    row.seats.push(seat);

    // Salen er lige så bred, som det sæde der står længst ude til højre
    if (seat.col > hall.columns) {
      hall.columns = seat.col;
    }
  }

  return halls;
}
