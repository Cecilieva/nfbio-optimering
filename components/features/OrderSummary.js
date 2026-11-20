import PosterPlaceholder from "@/components/features/PosterPlaceholder";
import { formatDay, formatDayKey, formatPrice, formatSeats, formatTime, formatWeekday } from "@/lib/format";
import { TICKET_TYPES, ticketPrice } from "@/lib/ticket-types";
import styles from "./OrderSummary.module.css";

// Gebyret er altid 0 kr. Linjen vises, så man kan se, at der ikke kommer noget oven i prisen
const FEE_DKK = 0;

// Hvornår filmen går: "I dag, tirsdag kl. 18.20" - eller fx "Mandag 16. november kl. 18.00"
function formatWhen(date) {
  const time = formatTime(date);

  if (formatDayKey(date) === formatDayKey(new Date())) {
    return `I dag, ${formatWeekday(date).toLowerCase()} kl. ${time}`;
  }

  // Stort forbogstav: "mandag" -> "Mandag"
  const day = formatDay(date);
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} kl. ${time}`;
}

// Linjerne med billetter, fx [{ label: "2 × Voksen", priceDkk: 280 }].
// Ved vi, hvilke billettyper man valgte, får hver type sin egen linje.
// Ellers står alle billetterne på én linje med prisen fra bookingen
function ticketLines(tickets, seats, showtime, totalDkk) {
  if (!tickets) {
    return [{ label: `${seats.length} × Billet`, priceDkk: totalDkk }];
  }

  // Kun de typer, man har valgt mindst én af
  return TICKET_TYPES.filter((type) => tickets[type.id] > 0).map((type) => ({
    label: `${tickets[type.id]} × ${type.label}`,
    priceDkk: tickets[type.id] * ticketPrice(type, showtime.price_dkk),
  }));
}

// "Din ordre": plakat, film, tid, biograf og sæder - og under det billetterne, gebyr og prisen i alt.
//
//   showtime - forestillingen fra getShowtime()
//   seats    - de valgte sæder
//   tickets  - antal pr. billettype, fx { adult: 2, child: 0, senior: 0 } (kan mangle)
//   totalDkk - prisen fra bookingen. Bruges, når vi ikke kender billettyperne
export default function OrderSummary({ showtime, seats = [], tickets, totalDkk }) {
  const { movie, hall } = showtime;
  const lines = ticketLines(tickets, seats, showtime, totalDkk);
  // I alt = alle billetlinjerne lagt sammen + gebyret
  const total = lines.reduce((sum, line) => sum + line.priceDkk, FEE_DKK);

  return (
    <section className={styles.card} aria-labelledby="order-summary-title">
      <h2 id="order-summary-title" className={styles.heading}>
        Din ordre
      </h2>

      {/* Plakaten til venstre og filmens oplysninger til højre */}
      <div className={styles.movie}>
        <div className={styles.poster}>
          {movie.poster_url ? (
            <img src={movie.poster_url} alt="" className={styles.image} />
          ) : (
            <PosterPlaceholder title={movie.title} />
          )}
        </div>
        <div className={styles.info}>
          <p className={styles.title}>{movie.title}</p>
          <p>{formatWhen(showtime.starts_at)}</p>
          <p>
            {hall.cinema.name} · {hall.name}
          </p>
          {/* Fx "Række 4, sæde 6–7" */}
          {seats.length > 0 && <p>{formatSeats(seats)}</p>}
        </div>
      </div>

      {/* Billetter og gebyr - mellem to streger */}
      <dl className={styles.lines}>
        {lines.map((line) => (
          <div key={line.label} className={styles.line}>
            <dt>{line.label}</dt>
            <dd>{formatPrice(line.priceDkk)}</dd>
          </div>
        ))}
        <div className={styles.line}>
          <dt>Gebyr</dt>
          <dd>{formatPrice(FEE_DKK)}</dd>
        </div>
      </dl>

      <dl className={styles.total}>
        <dt>I alt</dt>
        <dd>{formatPrice(total)}</dd>
      </dl>
    </section>
  );
}
