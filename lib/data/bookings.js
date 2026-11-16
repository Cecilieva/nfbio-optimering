import { readBookingCookie } from "@/lib/booking-cookie";
import { createClient } from "@/lib/supabase/server";

// The booking with this id, with seat_ids, or null.
// Logged-in owners can read it from the database. Guests and bookings without an owner yet
// can't (RLS), so for them we use the copy in the booking cookie – see lib/booking-cookie.js.
export async function getBooking(bookingId) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, booking_seats(seat_id)")
    .eq("id", bookingId)
    .maybeSingle();

  if (data) {
    const { booking_seats, ...booking } = data;
    return { ...booking, seat_ids: booking_seats.map((row) => row.seat_id) };
  }

  const copy = await readBookingCookie();

  return copy?.id === bookingId ? copy : null;
}

// A reservation is active until reserved_until, unless it is paid or cancelled
export function isReservationActive(booking) {
  return booking.status === "reserved" && new Date(booking.reserved_until) > new Date();
}

// Has the booking been given an owner with attach_booking_owner (or at reservation)?
export function hasOwner(booking) {
  return Boolean(booking.user_id || booking.guest_email);
}
