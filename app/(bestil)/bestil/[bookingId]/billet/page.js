import { notFound, redirect } from "next/navigation";
import Ticket from "@/components/features/Ticket";
import TicketPrint from "@/components/features/TicketPrint";
import Button from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { getBooking } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";
import { formatShowtimeLine } from "@/lib/format";
import styles from "./page.module.css";

export const metadata = {
  title: "Din billet",
};

// Trin 4 og sidste trin i købet: billetten printes, og bagefter står "Rigtig god fornøjelse!" under den
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

  // Hent forestillingen, sæderne og den, der er logget ind, på samme tid
  const [showtime, seats, user] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
    getCurrentUser(),
  ]);

  // "Billetten" ved én billet, ellers "Billetterne". Er man logget ind, ligger de også på profilen
  const tickets = seats.length === 1 ? "Billetten" : "Billetterne";
  const sentText = user
    ? `${tickets} er sendt til dig på SMS og ligger allerede under ”Mine billetter” på din profil`
    : `${tickets} er sendt til dig på SMS`;

  return (
    <main className={styles.page}>
      <TicketPrint
        subtitle={formatShowtimeLine(showtime)}
        ticket={<Ticket showtime={showtime} seats={seats} />}
      >
        <div className={styles.text}>
          <h2 className={styles.heading}>Rigtig god fornøjelse!</h2>
          <p className={styles.body}>{sentText}</p>
        </div>
        {/* ?intro=0: forsiden springer nedtællingen 3-2-1 over */}
        <Button href="/film?intro=0">Tilbage til forsiden</Button>
      </TicketPrint>
    </main>
  );
}
