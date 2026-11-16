import { createClient } from "@/lib/supabase/server";

// Every seat in the showtime's hall, grouped by row, with taken: true/false.
// The taken seats come from the taken_seats view (paid or still reserved).
// Returns [{ number: 4, seats: [{ id, row_number, seat_number, type, taken }] }]
export async function getSeatMap(showtime) {
  const supabase = await createClient();

  const [seatsResult, takenResult] = await Promise.all([
    supabase
      .from("seats")
      .select("id, row_number, seat_number, type")
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

  const takenIds = new Set(takenResult.data.map((row) => row.seat_id));
  const rows = new Map();

  for (const seat of seatsResult.data) {
    if (!rows.has(seat.row_number)) {
      rows.set(seat.row_number, { number: seat.row_number, seats: [] });
    }

    rows.get(seat.row_number).seats.push({ ...seat, taken: takenIds.has(seat.id) });
  }

  return [...rows.values()];
}

// The seats with these ids, e.g. for the order summary
export async function getSeatsByIds(seatIds) {
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
