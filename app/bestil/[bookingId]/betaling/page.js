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

// Figma: "Betaling" with the countdown on the reservation and inline errors
export default async function PaymentPage({ params }) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  if (!booking) {
    notFound();
  }

  if (booking.status === "paid") {
    redirect(`/bestil/${bookingId}/billet`);
  }

  if (!hasOwner(booking)) {
    redirect(`/bestil/${bookingId}/login`);
  }

  const [showtime, seats] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
  ]);

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
      <DataDump label="booking" data={booking} />
    </main>
  );
}
