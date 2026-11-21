import { notFound, redirect } from "next/navigation";
import Countdown from "@/components/features/Countdown";
import OrderSummary from "@/components/features/OrderSummary";
import PaymentForm from "@/components/features/PaymentForm";
import ReservationExpired from "@/components/features/ReservationExpired";
import StepHeader from "@/components/features/StepHeader";
import DataDump from "@/components/ui/DataDump";
import { getBooking, hasOwner, isReservationActive } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";

export const metadata = {
  title: "Betaling",
};

// Trin 3 i købet: betaling.
// Viser nedtællingen (hvor længe sæderne holdes), hvad man køber, og betalingsformularen.
// Betalingen er ikke rigtig - i formularen vælger man selv, om den lykkes eller fejler.
export default async function PaymentPage({ params }) {
  // bookingId er id'et i adressen, fx /bestil/abc123/betaling
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  // Findes reservationen ikke, viser vi 404-siden

  if (!booking) {
    notFound();
  }

  // Er der allerede betalt, går vi direkte til billetten
  if (booking.status === "paid") {
    redirect(`/bestil/${bookingId}/billet`);
  }

  // Har reservationen ingen ejer endnu, skal man først logge ind eller vælge gæst
  if (!hasOwner(booking)) {
    redirect(`/bestil/${bookingId}/login`);
  }

  // Hent forestillingen og sæderne på samme tid
  const [showtime, seats] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
  ]);

  // "Vælg pladser igen" på "Tiden er udløbet" fører til "Vælg dine pladser" med de samme billetter.
  // ?booking=… fortæller sædevalget, hvilken reservation man kommer fra
  const restartHref = `/bestil/saeder/${booking.showtime_id}?booking=${bookingId}`;

  // Sæderne holdes kun i en kort tid. Var tiden allerede gået, vises "Tiden er udløbet" i stedet for siden
  if (!isReservationActive(booking)) {
    return (
      <main>
        <ReservationExpired href={restartHref} />
      </main>
    );
  }

  return (
    <main>
      <StepHeader step={3} title="Betaling" />
      {/* Rammer uret 00:00, lægges "Tiden er udløbet" over siden */}
      <Countdown until={booking.reserved_until} expiredHref={restartHref} />
      <OrderSummary showtime={showtime} seats={seats} totalDkk={booking.total_dkk} />
      <PaymentForm bookingId={bookingId} />
      {/* Pladsholder: viser rå data, indtil siden er bygget */}
      <DataDump label="booking" data={booking} />
    </main>
  );
}
