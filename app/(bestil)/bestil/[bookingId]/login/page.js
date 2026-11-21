import { notFound, redirect } from "next/navigation";
import BottomBar from "@/components/features/checkout/BottomBar";
import CheckoutLogin from "@/components/features/checkout/CheckoutLogin";
import Countdown from "@/components/features/checkout/Countdown";
import OrderSummary from "@/components/features/checkout/OrderSummary";
import ReservationExpired from "@/components/features/checkout/ReservationExpired";
import StepHeader from "@/components/features/checkout/StepHeader";
import Seat from "@/components/ui/Seat";
import { getCurrentUser } from "@/lib/auth";
import { getBooking, hasOwner, isReservationActive } from "@/lib/data/bookings";
import { getSeatsByIds } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";
import { formatSeats } from "@/lib/format";
import styles from "./page.module.css";

export const metadata = {
  title: "Log ind eller fortsæt som gæst",
};

// Trin 3 i købet: "Dine oplysninger". Her vælger man at logge ind eller fortsætte som gæst.
// Sæderne er reserveret, men vi ved endnu ikke, hvem der køber dem.
// Til venstre står "Din ordre", til højre log ind / gæst, og i bunden uret.
// Logger man ind, kommer man tilbage hertil bagefter.
export default async function BookingLoginPage({ params, searchParams }) {
  // bookingId er id'et i adressen, fx /bestil/abc123/login
  const { bookingId } = await params;
  // Hvilket kort der vises til højre: ?gaest=1 er "Fortsæt som gæst", ?opret=1 er "Opret profil"
  const { gaest, opret } = await searchParams;
  let mode = "login";
  if (gaest === "1") mode = "guest";
  if (opret === "1") mode = "signup";
  const booking = await getBooking(bookingId);

  // Findes reservationen ikke, viser vi 404-siden
  if (!booking) {
    notFound();
  }

  // Har reservationen allerede en ejer (man var logget ind, da man valgte sæder),
  // springer vi dette trin over og går direkte til betaling
  if (hasOwner(booking)) {
    redirect(`/bestil/${bookingId}/betaling`);
  }

  // Hent forestillingen, sæderne og brugeren på samme tid (Promise.all = alle tre samtidig)
  const [showtime, seats, user] = await Promise.all([
    getShowtime(booking.showtime_id),
    getSeatsByIds(booking.seat_ids),
    getCurrentUser(),
  ]);
  // Adressen på denne side - så login og "Opret profil" kan sende en tilbage hertil bagefter
  const here = `/bestil/${bookingId}/login`;
  // "Tilbage" fører til "Vælg dine pladser" for samme forestilling, med de sæder man har valgt
  const seatsHref = `/bestil/saeder/${booking.showtime_id}?booking=${bookingId}`;

  // "Vælg pladser igen" på "Tiden er udløbet" fører til "Vælg dine pladser" med de samme billetter.
  // ?booking=… fortæller sædevalget, hvilken reservation man kommer fra
  const restartHref = `/bestil/saeder/${booking.showtime_id}?booking=${bookingId}`;

  // Sæderne holdes kun i en kort tid. Var tiden allerede gået, vises "Tiden er udløbet" i stedet for siden
  if (!isReservationActive(booking)) {
    return (
      <main id="indhold">
        <ReservationExpired href={restartHref} />
      </main>
    );
  }

  return (
    // Opret profil er et langt kort. På desktop står siden derfor stille (data-fit-screen),
    // og man scroller kun inde i kortet til højre
    <main id="indhold" className={styles.page} data-fit-screen={mode === "signup" || undefined}>
      {/* Fra gæst eller opret profil fører "Tilbage" kun ét skridt tilbage: til "Har du en profil?" */}
      <StepHeader step={3} title="Dine oplysninger" backHref={mode === "login" ? seatsHref : here} />

      {/* "Din ordre" og log ind / gæst ved siden af hinanden - under hinanden på mobil */}
      <div className={styles.columns}>
        <OrderSummary
          showtime={showtime}
          seats={seats}
          tickets={booking.tickets}
          totalDkk={booking.total_dkk}
        />
        {/* Boksen om kortet til højre. Ved "Opret profil" er det den, man scroller i (se CSS'en) */}
        <div className={styles.side}>
          <CheckoutLogin
            bookingId={bookingId}
            next={here}
            email={user?.email}
            mode={mode}
          />
        </div>
      </div>

      {/* Bunden: de valgte sæder og hvor længe de holdes */}
      <BottomBar
        summary={
          <>
            <Seat state="selected" />
            {formatSeats(seats)}
          </>
        }
      >
        {/* Rammer uret 00:00, lægges "Tiden er udløbet" over siden */}
        <Countdown until={booking.reserved_until} expiredHref={restartHref} />
      </BottomBar>
    </main>
  );
}
