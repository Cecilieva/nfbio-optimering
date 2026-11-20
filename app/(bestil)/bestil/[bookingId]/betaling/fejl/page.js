import Button from "@/components/ui/Button";
import { getBooking } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { formatSeats } from "@/lib/format";
import { getPaymentError } from "@/lib/payment-errors";

export const metadata = {
  title: "Betalingen fejlede",
};

// Figma: "Betalingsfejl" – the full-page error, e.g. ?kode=MP-408
export default async function PaymentErrorPage({ params, searchParams }) {
  const { bookingId } = await params;
  const { kode } = await searchParams;
  const paymentError = getPaymentError(kode);

  // The seats are still reserved, so we remind the user which ones
  const booking = await getBooking(bookingId);
  const seats = booking ? await getSeatsByIds(booking.seat_ids) : [];

  return (
    <main>
      <h1>Betalingen fejlede</h1>
      <p>{paymentError.message}</p>
      {kode && <p>Fejlkode: {kode}</p>}
      {seats.length > 0 && <p>Dine pladser er stadig reserveret: {formatSeats(seats)}</p>}
      <Button href={`/bestil/${bookingId}/betaling`}>Prøv igen</Button>
    </main>
  );
}
