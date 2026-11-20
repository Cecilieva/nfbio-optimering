import { notFound } from "next/navigation";
import SeatPicker from "@/components/features/SeatPicker";
import { getSeatMap } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";
import { formatDayKey, formatDayMonthShort, formatTime } from "@/lib/format";
import styles from "./page.module.css";

export const metadata = {
  title: "Vælg billetter",
};

// Trin 1 og 2 i købet: vælg antal billetter og derefter sæder.
// Begge trin er på samme side - SeatPicker skifter mellem dem.
export default async function SeatsPage({ params }) {
  const { showtimeId } = await params;
  const showtime = await getShowtime(Number(showtimeId));

  if (!showtime) {
    notFound();
  }

  const rows = await getSeatMap(showtime);

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
      />
    </main>
  );
}
