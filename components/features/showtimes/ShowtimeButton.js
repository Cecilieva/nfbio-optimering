import { formatTime } from "@/lib/format";
import StatusDot from "./StatusDot";
import styles from "./ShowtimeButton.module.css";

// Ét tidspunkt i skemaet, fx "18.20 – Sal 7 · 2D" med en farvet prik i hjørnet.
// Den kan se ud på tre måder:
//   almindelig – mørk boks
//   valgt      – blå kant (når selected er true)
//   udsolgt    – tonet ned, kan ikke klikkes, og der står "Udsolgt"
// onSelect kører, når man klikker på tidspunktet.
export default function ShowtimeButton({ showtime, selected, onSelect }) {
  // Er forestillingen udsolgt?
  const soldOut = showtime.seat_status === "sold_out";

  return (
    <button type="button" className={styles.button} aria-pressed={selected} disabled={soldOut} onClick={onSelect}>
      <span className={styles.time}>{formatTime(showtime.starts_at)}</span>
      <span className={styles.info}>
        {showtime.hall.name} · {soldOut ? "Udsolgt" : showtime.format}
      </span>
      <StatusDot status={showtime.seat_status} className={styles.dot} />
    </button>
  );
}
