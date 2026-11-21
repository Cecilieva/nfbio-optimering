import { notFound } from "next/navigation";
import SeatPicker from "@/components/features/SeatPicker";
import { getBooking, isReservationActive } from "@/lib/data/bookings";
import { getSeatMap } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";
import { formatDayKey, formatDayMonthShort, formatTime } from "@/lib/format";
import styles from "./page.module.css";

export const metadata = {
  title: "Vælg billetter",
};

// Trin 1 og 2 i købet: vælg antal billetter og derefter sæder.
// Begge trin er på samme side - SeatPicker skifter mellem dem.
//
// Står der ?booking=… i adressen, kommer man tilbage fra "Dine oplysninger".
// Så starter siden på "Vælg dine pladser" med de sæder, man allerede har reserveret.
// Er reservationen udløbet, starter siden også på "Vælg dine pladser" - men med nye pladser og et nyt ur.
export default async function SeatsPage({ params, searchParams }) {
  const { showtimeId } = await params;
  const { booking: bookingId } = await searchParams;
  const showtime = await getShowtime(Number(showtimeId));

  if (!showtime) {
    notFound();
  }

  // Hent salen og (hvis man kommer tilbage) ens reservation på samme tid
  const [seatMap, booking] = await Promise.all([
    getSeatMap(showtime),
    bookingId ? getBooking(bookingId) : null,
  ]);

  // Reservationen bruges kun, hvis den er til denne forestilling
  const sameShowtime = booking?.showtime_id === showtime.id;
  // Tiden er ikke løbet ud: man fortsætter med de samme sæder og det samme ur
  const resume = sameShowtime && isReservationActive(booking) ? booking : null;
  // Tiden er løbet ud ("Tiden er udløbet"): samme billetter, men nye pladser og et nyt ur
  const restart = sameShowtime && !resume ? booking : null;

  // Ens egne sæder skal ikke vises som optaget - de er jo ens egne
  const ownSeatIds = resume?.seat_ids ?? [];
  const rows = seatMap.map((row) => ({
    ...row,
    seats: row.seats.map((seat) => ({ ...seat, taken: seat.taken && !ownSeatIds.includes(seat.id) })),
  }));

  // Underteksten i trin-headeren, fx "Clayface · i dag kl. 19.30 · Aarhus Bio"
  const isToday = formatDayKey(showtime.starts_at) === formatDayKey(new Date());
  const day = isToday ? "i dag" : formatDayMonthShort(showtime.starts_at);
  const subtitle = `${showtime.movie.title} · ${day} kl. ${formatTime(showtime.starts_at)} · ${showtime.hall.cinema.name}`;

  return (
    // data-fit-screen: siden er lige så høj som skærmen og kan ikke scrolles (på desktop)
    <main className={styles.page} data-fit-screen>
      <SeatPicker
        showtime={showtime}
        rows={rows}
        subtitle={subtitle}
        backHref={`/film/${showtime.movie.slug}`}
        resume={resume}
        restart={restart}
      />
    </main>
  );
}
