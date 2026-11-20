import Button from "@/components/ui/Button";
import { getBooking } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { formatSeats } from "@/lib/format";
import { getPaymentError } from "@/lib/payment-errors";

export const metadata = {
  title: "Betalingen fejlede",
};

// Fejlsiden - vises, når betalingen fejler på en måde, der kræver en hel side.
// Fejlkoden står i adressen, fx /bestil/abc123/betaling/fejl?kode=MP-408
// (de mindre fejl vises i stedet direkte i betalingsformularen)
export default async function PaymentErrorPage({ params, searchParams }) {
  const { bookingId } = await params;
  // ?kode=… fra adressen
  const { kode } = await searchParams;
  // Slå fejlteksten op i lib/payment-errors.js
  const paymentError = getPaymentError(kode);

  // Sæderne er stadig reserveret, så vi minder brugeren om, hvilke det er
  const booking = await getBooking(bookingId);
  const seats = booking ? await getSeatsByIds(booking.seat_ids) : [];

  return (
    <main>
      <h1>Betalingen fejlede</h1>
      <p>{paymentError.message}</p>
      {kode && <p>Fejlkode: {kode}</p>}
      {seats.length > 0 && <p>Dine pladser er stadig reserveret: {formatSeats(seats)}</p>}
      {/* Tilbage til betalingen for at prøve igen */}
      <Button href={`/bestil/${bookingId}/betaling`}>Prøv igen</Button>
    </main>
  );
}
