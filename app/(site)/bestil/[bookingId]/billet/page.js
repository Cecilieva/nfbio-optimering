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

// Figma: "Billet" – the printing animation, then the finished ticket
export default async function TicketPage({ params }) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  if (!booking) {
    notFound();
  }

  if (booking.status !== "paid") {
    redirect(`/bestil/${bookingId}/betaling`);
  }

  const [showtime, seats] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
  ]);

  return (
    <main>
      <StepHeader step={4} title="Din billet" />
      <TicketPrint>
        <p>Billetkode: {booking.ticket_code}</p>
        <p>{formatSeats(seats)}</p>
        <OrderSummary showtime={showtime} seats={seats} totalDkk={booking.total_dkk} />
      </TicketPrint>
      <DataDump label="booking" data={booking} />
    </main>
  );
}
