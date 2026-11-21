import { cookies } from "next/headers";

// En gæst må ikke læse sin booking i databasen - det må kun den, der er logget ind og ejer den.
// Derfor gemmer vi en kopi af bookingen i denne cookie (med sæder og billettyper).
// lib/actions/booking.js skriver kopien, og lib/data/bookings.js læser den.
// Kopien bruges kun til at vise bookingen - databasen tjekker selv alt, når man reserverer og betaler.
const BOOKING_COOKIE = "nf_booking";

export async function readBookingCookie() {
  const cookieStore = await cookies();
  const value = cookieStore.get(BOOKING_COOKIE)?.value;

  // Ingen cookie endnu
  if (!value) {
    return null;
  }

  // Er cookien ødelagt, lader vi som om, der ingen er
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Gemmer kopien i ét døgn. httpOnly: browserens JavaScript kan ikke læse den.
// Virker kun i server actions (fx lib/actions/booking.js) - ikke på en almindelig side
export async function writeBookingCookie(booking) {
  const cookieStore = await cookies();

  cookieStore.set(BOOKING_COOKIE, JSON.stringify(booking), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

// Gemmer bookingen i cookien. Sæder og billettyper beholdes fra den gamle kopi,
// medmindre der står nye i extra
export async function saveBooking(booking, extra = {}) {
  const copy = await readBookingCookie();
  const old = copy?.id === booking.id ? copy : {};

  await writeBookingCookie({ seat_ids: [], ...old, ...booking, ...extra });
}
