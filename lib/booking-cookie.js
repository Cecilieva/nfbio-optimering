import { cookies } from "next/headers";

// RLS only lets logged-in users read their own bookings, so a guest can't read theirs.
// Every booking RPC returns the whole row, so we keep a copy of it in this cookie,
// together with the seat ids. lib/data/bookings.js reads it, and lib/actions/booking.js writes it.
// The copy is only shown to the user – the RPCs check everything again in the database.
const BOOKING_COOKIE = "nf_booking";

export async function readBookingCookie() {
  const cookieStore = await cookies();
  const value = cookieStore.get(BOOKING_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Only works in Server Actions and Route Handlers
export async function writeBookingCookie(booking) {
  const cookieStore = await cookies();

  cookieStore.set(BOOKING_COOKIE, JSON.stringify(booking), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}
