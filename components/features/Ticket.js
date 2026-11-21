import { formatSeatParts, formatShowDay, formatTime } from "@/lib/format";
import styles from "./Ticket.module.css";

// Billetten (Figma "Billet"): papiret med splinter og stubben til højre med teksten på langs.
//
//   showtime - forestillingen fra getShowtime()
//   seats    - de købte sæder
export default function Ticket({ showtime, seats }) {
  const { movie, hall } = showtime;

  // Fx "Række 4" og "Sæder 6–7"
  const seatParts = formatSeatParts(seats);
  const row = `Række ${seatParts.rows}`;
  const seatText = `${seats.length === 1 ? "Sæde" : "Sæder"} ${seatParts.seats}`;

  // Fx "I dag" (med stort) og "kl. 18.20"
  const showDay = formatShowDay(showtime.starts_at);
  const day = showDay.charAt(0).toUpperCase() + showDay.slice(1);
  const time = `kl. ${formatTime(showtime.starts_at)}`;

  return (
    <div className={styles.ticket}>
      {/* Splinterne på papiret - kun pynt */}
      <img src="/billet/moenster.svg" alt="" className={styles.pattern} />

      {/* Hoveddelen: titel, sted, tid og det med småt */}
      <div className={styles.main}>
        <div className={styles.text}>
          <p className={styles.title}>{movie.title}</p>
          <div className={styles.details}>
            <p className={styles.column}>
              <span>
                {hall.cinema.name} · {hall.name}
              </span>
              <span>{row}</span>
              <span>{seatText}</span>
            </p>
            <p className={styles.column}>
              <span>{day}</span>
              <span>{time}</span>
            </p>
          </div>
        </div>
        <p className={styles.terms}>Gyldig til denne forestilling. Ret til ændringer forbeholdes.</p>
      </div>

      {/* Stubben gentager det vigtigste, så skærmlæsere springer den over */}
      <div className={styles.stub} aria-hidden="true">
        <div className={styles.stubText}>
          <p className={styles.stubTitle}>{movie.title}</p>
          <div className={styles.stubDetails}>
            <p className={styles.column}>
              <span>{hall.name}</span>
              <span>{row}</span>
              <span>{seatText}</span>
            </p>
            <p className={styles.column}>
              <span>{day}</span>
              <span>{time}</span>
            </p>
          </div>
        </div>
        <img src="/icons/bear.svg" alt="" className={styles.logo} />
      </div>
    </div>
  );
}
