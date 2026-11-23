import { formatTime } from "@/lib/format";
import { getShowtimeLabels, shortLanguage } from "@/lib/showtime-tags";
import StatusDot from "./StatusDot";
import styles from "./ShowtimeButton.module.css";

// Ét tidspunkt i skemaet, fx "18.20" og under det "Bio 7 · 2D · Eng. tale · Babybio", med en farvet prik i hjørnet.
// Linjen har sal, format, sprog og evt. særforestilling og "Uden undertekster" (som på nfbio.dk) – den brydes, hvis den er lang.
// Den kan se ud på tre måder:
//   almindelig – mørk boks
//   valgt      – blå kant (når selected er true)
//   udsolgt    – tonet ned, kan ikke klikkes, og der står "Udsolgt"
// onSelect kører, når man klikker på tidspunktet.
//   language - filmens sprog, fx "Engelsk tale" (står forkortet: "Eng. tale")
export default function ShowtimeButton({ showtime, language, selected, onSelect }) {
  // Er forestillingen udsolgt?
  const soldOut = showtime.seat_status === "sold_out";
  // Linjen under klokkeslættet. Udsolgt: kun sal og "Udsolgt"
  const info = soldOut
    ? [showtime.hall.name, "Udsolgt"]
    : [showtime.hall.name, showtime.format, shortLanguage(language), ...getShowtimeLabels(showtime.tags)].filter(Boolean);

  return (
    <button type="button" className={styles.button} aria-pressed={selected} disabled={soldOut} onClick={onSelect}>
      <span className={styles.time}>{formatTime(showtime.starts_at)}</span>
      {/* Hver del holdes samlet (fx "Eng. tale"), og prikken følger delen før – så linjen kun brydes mellem delene */}
      <span className={styles.info}>
        {info.map((part, index) => (
          <span key={part}>
            <span className={styles.part}>
              {part}
              {index < info.length - 1 && " ·"}
            </span>
            {/* Mellemrummet står uden for delen, så linjen kan brydes her */}
            {index < info.length - 1 && " "}
          </span>
        ))}
      </span>
      <StatusDot status={showtime.seat_status} className={styles.dot} />
    </button>
  );
}
