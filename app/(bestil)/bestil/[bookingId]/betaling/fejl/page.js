import { notFound, redirect } from "next/navigation";
import PaymentFailed from "@/components/features/payment/PaymentFailed";
import ReservationExpired from "@/components/features/checkout/ReservationExpired";
import { getBooking, getMinutesLeft, hasOwner, isReservationActive } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { formatSeats } from "@/lib/format";
import { getPaymentError } from "@/lib/payment-errors";

export const metadata = {
  title: "Betalingen fejlede",
};

// Fejlsiden, når betalingen fejler. Metoden står i adressen, fx ?metode=card
export default async function PaymentErrorPage({ params, searchParams }) {
  const { bookingId } = await params;
  const { metode } = await searchParams;
  const booking = await getBooking(bookingId);

  if (!booking) {
    notFound();
  }

  // Allerede betalt: videre til billetten
  if (booking.status === "paid") {
    redirect(`/bestil/${bookingId}/billet`);
  }

  // Ingen ejer endnu: først log ind eller gæst
  if (!hasOwner(booking)) {
    redirect(`/bestil/${bookingId}/login`);
  }

  // Ukendt metode: ingen fejl at vise
  if (!getPaymentError(metode)) {
    redirect(`/bestil/${bookingId}/betaling`);
  }

  // Tiden er gået: vis "Tiden er udløbet"
  if (!isReservationActive(booking)) {
    return (
      <main id="indhold">
        <ReservationExpired href={`/bestil/saeder/${booking.showtime_id}?booking=${bookingId}`} />
      </main>
    );
  }

  const seats = await getSeatsByIds(booking.seat_ids);

  return (
    <main id="indhold">
      <PaymentFailed
        bookingId={bookingId}
        method={metode}
        minutesLeft={getMinutesLeft(booking)}
        seatsLabel={formatSeats(seats)}
      />
    </main>
  );
}
