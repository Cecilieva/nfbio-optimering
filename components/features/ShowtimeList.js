import Link from "next/link";
import { formatDay, formatDayKey, formatPrice, formatTime } from "@/lib/format";

// Groups the showtimes by day, and each day by cinema:
// [{ key, label, cinemas: [{ slug, name, showtimes: [...] }] }]
function groupShowtimes(showtimes) {
  const days = new Map();

  for (const showtime of showtimes) {
    const key = formatDayKey(showtime.starts_at);

    if (!days.has(key)) {
      days.set(key, { key, label: formatDay(showtime.starts_at), cinemas: new Map() });
    }

    const cinemas = days.get(key).cinemas;
    const cinema = showtime.hall.cinema;

    if (!cinemas.has(cinema.slug)) {
      cinemas.set(cinema.slug, { slug: cinema.slug, name: cinema.name, showtimes: [] });
    }

    cinemas.get(cinema.slug).showtimes.push(showtime);
  }

  return [...days.values()].map((day) => ({ ...day, cinemas: [...day.cinemas.values()] }));
}

/**
 * The film's showtimes by day and cinema. Each time links to the seat selection.
 *
 * @param {object} props
 * @param {Array<{ id: number, starts_at: string, format: string, price_dkk: number, hall: { name: string, cinema: { name: string, slug: string } } }>} props.showtimes
 */
export default function ShowtimeList({ showtimes }) {
  if (showtimes.length === 0) {
    return <p>Der er ingen kommende spilletider i din by.</p>;
  }

  return groupShowtimes(showtimes).map((day) => (
    <section key={day.key}>
      <h3>{day.label}</h3>
      {day.cinemas.map((cinema) => (
        <div key={cinema.slug}>
          <h4>{cinema.name}</h4>
          <ul>
            {cinema.showtimes.map((showtime) => (
              <li key={showtime.id}>
                <Link href={`/bestil/saeder/${showtime.id}`}>
                  {formatTime(showtime.starts_at)} · {showtime.hall.name} · {showtime.format} ·{" "}
                  {formatPrice(showtime.price_dkk)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  ));
}
