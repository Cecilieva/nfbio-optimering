import { readBookingCookie } from "@/lib/booking-cookie";
import { createClient } from "@/lib/supabase/server";

// Henter bookingen med sæde-id'erne (seat_ids) og billettyperne (tickets). Findes den ikke: null.
// Kun den, der er logget ind og ejer bookingen, må læse den i databasen.
// Alle andre (gæster og bookinger uden ejer) får kopien fra cookien - se lib/booking-cookie.js
export async function getBooking(bookingId) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, booking_seats(seat_id)")
    .eq("id", bookingId)
    .maybeSingle();

  const copy = await readBookingCookie();

  if (data) {
    // booking_seats er en liste som [{ seat_id: 12 }, …] - vi vil bare have tallene
    const { booking_seats, ...booking } = data;
    // Billettyperne findes kun i kopien i cookien (databasen kender dem ikke)
    const tickets = copy?.id === bookingId ? copy.tickets : null;
    return { ...booking, seat_ids: booking_seats.map((row) => row.seat_id), tickets };
  }

  return copy?.id === bookingId ? copy : null;
}

// Holdes sæderne stadig? Ja, indtil reserved_until - medmindre der er betalt eller annulleret
export function isReservationActive(booking) {
  return booking.status === "reserved" && new Date(booking.reserved_until) > new Date();
}

// Har bookingen fået en ejer? Enten en bruger, der er logget ind, eller en gæst med e-mail
export function hasOwner(booking) {
  return Boolean(booking.user_id || booking.guest_email);
}
