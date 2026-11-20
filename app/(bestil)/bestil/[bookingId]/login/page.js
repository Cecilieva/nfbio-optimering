import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AttachOwnerForm from "@/components/features/AttachOwnerForm";
import OrderSummary from "@/components/features/OrderSummary";
import StepHeader from "@/components/features/StepHeader";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { signIn } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { getBooking, hasOwner, isReservationActive } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";

export const metadata = {
  title: "Log ind eller fortsæt som gæst",
};

// Trin 2 i købet: log ind eller fortsæt som gæst.
// Sæderne er reserveret, men reservationen har endnu ingen ejer.
// Her vælger man: log ind, fortsæt som gæst eller opret en profil.
// Når man logger ind, kommer man tilbage hertil og kan gøre sig til ejer af reservationen.
export default async function BookingLoginPage({ params }) {
  // bookingId er id'et i adressen, fx /bestil/abc123/login
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  // Findes reservationen ikke, viser vi 404-siden

  if (!booking) {
    notFound();
  }

  // Har reservationen allerede en ejer (man var logget ind, da man valgte sæder),
  // springer vi dette trin over og går direkte til betaling
  if (hasOwner(booking)) {
    redirect(`/bestil/${bookingId}/betaling`);
  }

  // Hent forestillingen, sæderne og brugeren på samme tid (Promise.all = alle tre samtidig)
  const [showtime, seats, user] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
    getCurrentUser(),
  ]);
  // Adressen på denne side - så login og "Opret profil" kan sende en tilbage hertil bagefter
  const here = `/bestil/${bookingId}/login`;

  // Sæderne holdes kun i en kort tid. Er tiden gået, skal man vælge sæder igen
  if (!isReservationActive(booking)) {
    return (
      <main>
        <h1>Reservationen er udløbet</h1>
        <Link href={`/bestil/saeder/${booking.showtime_id}`}>Vælg sæder igen</Link>
      </main>
    );
  }

  return (
    <main>
      <StepHeader step={2} title="Log ind eller fortsæt som gæst" />
      <OrderSummary showtime={showtime} seats={seats} totalDkk={booking.total_dkk} />

      {/* Logget ind: én knap, der gør brugeren til ejer. Ellers: log ind, gæst eller opret profil */}
      {user ? (
        <AttachOwnerForm bookingId={bookingId} email={user.email} />
      ) : (
        <>
          <h2>Log ind</h2>
          <form action={signIn}>
            {/* Skjult felt: efter login sendes man tilbage til denne side */}
            <input type="hidden" name="next" value={here} />
            <TextField label="E-mail" name="email" type="email" autoComplete="email" required />
            <TextField
              label="Adgangskode"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Button type="submit">Log ind</Button>
          </form>

          <h2>Fortsæt som gæst</h2>
          <AttachOwnerForm bookingId={bookingId} asGuest />

          <h2>Ny her?</h2>
          <Button variant="secondary" href={`/signup?next=${encodeURIComponent(here)}`}>
            Opret profil
          </Button>
        </>
      )}
    </main>
  );
}
