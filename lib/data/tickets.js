import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// De købte billetter til film, der ikke er startet endnu. Den næste kommer først
export async function getMyTickets() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, showtime:showtimes(starts_at, movie:movies(title), hall:halls(name, cinema:cinemas(name))), booking_seats(seat:seats(id, row_number, seat_number))",
    )
    .eq("user_id", user.sub)
    .eq("status", "paid");

  if (error) {
    throw error;
  }

  return data
    .filter((booking) => new Date(booking.showtime.starts_at) > new Date())
    .sort((a, b) => new Date(a.showtime.starts_at) - new Date(b.showtime.starts_at))
    .map((booking) => ({
      id: booking.id,
      showtime: booking.showtime,
      seats: booking.booking_seats.map((row) => row.seat),
    }));
}
