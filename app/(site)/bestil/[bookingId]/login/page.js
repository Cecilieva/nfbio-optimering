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

// Figma: "Log ind / fortsæt som gæst / opret profil".
// The reservation has no owner yet. Logging in brings you back here,
// and attach_booking_owner then makes you (or the guest) the owner.
export default async function BookingLoginPage({ params }) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  if (!booking) {
    notFound();
  }

  // Logged in when reserving, or already attached: nothing to do here
  if (hasOwner(booking)) {
    redirect(`/bestil/${bookingId}/betaling`);
  }

  const [showtime, seats, user] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
    getCurrentUser(),
  ]);
  const here = `/bestil/${bookingId}/login`;

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

      {user ? (
        <AttachOwnerForm bookingId={bookingId} email={user.email} />
      ) : (
        <>
          <h2>Log ind</h2>
          <form action={signIn}>
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
