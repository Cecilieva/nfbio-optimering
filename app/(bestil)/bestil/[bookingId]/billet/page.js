import { notFound, redirect } from "next/navigation";
import OrderSummary from "@/components/features/OrderSummary";
import StepHeader from "@/components/features/StepHeader";
import TicketPrint from "@/components/features/TicketPrint";
import DataDump from "@/components/ui/DataDump";
import { getBooking } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";
import { formatSeats } from "@/lib/format";

export const metadata = {
  title: "Din billet",
};

// Trin 4 og sidste trin i købet: billetten.
// Først "printes" billetten (en animation), og bagefter vises den færdige billet.
export default async function TicketPage({ params }) {
  // bookingId er id'et i adressen, fx /bestil/abc123/billet
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  // Findes købet ikke, viser vi 404-siden

  if (!booking) {
    notFound();
  }

  // Ingen billet uden betaling - er der ikke betalt, sender vi brugeren tilbage til betalingen
  if (booking.status !== "paid") {
    redirect(`/bestil/${bookingId}/betaling`);
  }

  // Hent forestillingen og sæderne på samme tid
  const [showtime, seats] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
  ]);

  return (
    <main>
      <StepHeader step={4} title="Din billet" />
      {/* TicketPrint står for print-animationen. Indholdet er det, der står på billetten */}
      <TicketPrint>
        <p>Billetkode: {booking.ticket_code}</p>
        <p>{formatSeats(seats)}</p>
        <OrderSummary showtime={showtime} seats={seats} totalDkk={booking.total_dkk} />
      </TicketPrint>
      {/* Pladsholder: viser rå data, indtil siden er bygget */}
      <DataDump label="booking" data={booking} />
    </main>
  );
}
