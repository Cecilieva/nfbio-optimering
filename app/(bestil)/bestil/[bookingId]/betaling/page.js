import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Countdown from "@/components/features/Countdown";
import OrderSummary from "@/components/features/OrderSummary";
import PaymentForm from "@/components/features/PaymentForm";
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
      <StepHeader step={3} title="Betaling" />
      <Countdown until={booking.reserved_until} />
      <OrderSummary showtime={showtime} seats={seats} totalDkk={booking.total_dkk} />
      <PaymentForm bookingId={bookingId} />
      {/* Pladsholder: viser rå data, indtil siden er bygget */}
      <DataDump label="booking" data={booking} />
    </main>
  );
}
