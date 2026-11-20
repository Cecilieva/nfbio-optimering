import Seat from "@/components/ui/Seat";
import { formatPrice, formatSeatParts } from "@/lib/format";
import styles from "./SeatView.module.css";

// Hvor i salen sidder man? Regnes ud fra gennemsnittet af de valgte sæder.
//   depth - 0 = forreste række, 1 = bagerste
//   side  - 0 = midt for lærredet, -0.5 = helt ude til venstre, 0.5 = helt ude til højre
// Uden valgte sæder: midt i salen
function seatPosition(seats, rows) {
  if (seats.length === 0) {
    return { depth: 0.5, side: 0 };
  }

  const first = rows[0].number;
  const last = rows[rows.length - 1].number;
  const averageRow = seats.reduce((sum, seat) => sum + seat.row_number, 0) / seats.length;
  const depth = (averageRow - first) / (last - first || 1);

  const columns = Math.max(...rows.flatMap((row) => row.seats.map((seat) => seat.col)));
  const averageColumn = seats.reduce((sum, seat) => sum + seat.col, 0) / seats.length;
  const side = (averageColumn - (columns + 1) / 2) / columns;

  return { depth, side };
}

// Panelet ved siden af salen: hvordan lærredet ser ud fra de valgte sæder,
// række og sæder, antal billetter, prisen og knappen videre.
// Hver gang man vælger sæder, glider lærredet på plads og drejer sig til den vinkel,
// man ser det fra: skråt, hvis man sidder i siden, og større, jo tættere man sidder på.
//
//   seats    - de valgte sæder (fra getSeatMap)
//   rows     - hele salen (fra getSeatMap) - bruges til at regne ud, hvor i salen man sidder
//   quantity - hvor mange billetter man har valgt
//   totalDkk - den samlede pris
//   children - knappen nederst, fx "Til betaling"
export default function SeatView({ seats, rows, quantity, totalDkk, children }) {
  const parts = formatSeatParts(seats);

  // Én stol pr. billet: de valgte er blå, resten er ledige
  const chairs = Array.from({ length: quantity }, (_, index) => index < seats.length);

  // Skifter, når man vælger et andet sæde - så starter animationen forfra (se key nedenfor)
  const selectionKey = seats.map((seat) => seat.id).join("-");

  // Vinklen på lærredet. CSS'en bruger de to tal (se .screenBox):
  //   --view-turn  - -1 … 1. Sidder man til venstre, drejer lærredet, så man ser det fra venstre
  //   --view-depth -  0 … 1. Forrest er lærredet stort, bagerst er det lille
  const position = seatPosition(seats, rows);
  const viewStyle = {
    "--view-turn": Math.max(-1, Math.min(1, -position.side * 2)),
    "--view-depth": position.depth,
  };

  return (
    <aside className={styles.panel} aria-label="Udsigt fra sædet">
      <div className={styles.view} aria-hidden="true">
        <p className={styles.label}>LÆRRED</p>
        <div key={selectionKey} className={styles.screen}>
          <div className={styles.screenBox} style={viewStyle}>
            <img src="/icons/seats/screen-perspective.svg" alt="" className={styles.screenImage} />
          </div>
        </div>
        <div className={styles.chairs}>
          {chairs.map((selected, index) => (
            <Seat key={index} state={selected ? "selected" : "free"} />
          ))}
        </div>
      </div>

      {/* Række og sæder. aria-live: skærmlæseren siger det, når man vælger et sæde */}
      <dl className={styles.boxes} aria-live="polite">
        <div className={styles.box}>
          <dt>Række</dt>
          <dd className={styles.value}>{parts.rows || "–"}</dd>
        </div>
        <div className={styles.box}>
          <dt>Sæder</dt>
          <dd className={styles.value}>{parts.seats || "–"}</dd>
        </div>
      </dl>

      <div className={styles.summary}>
        <div className={styles.amount}>
          <span className={styles.tickets}>
            {quantity} {quantity === 1 ? "billet" : "billetter"}
          </span>
          <span className={styles.price}>{formatPrice(totalDkk)}</span>
        </div>
        {children}
      </div>
    </aside>
  );
}
