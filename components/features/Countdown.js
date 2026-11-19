"use client";

import { useEffect, useState } from "react";
import { startOfDanishDay } from "@/lib/format";
import styles from "./Countdown.module.css";

function formatRemaining(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

// Millisekunder → { days, hours, minutes, seconds }, fx til "08 dage 13 timer 42 min 57 sek".
// Math.max(0, …) sørger for, at der aldrig står minus, når tiden er gået.
// 86400 = sekunder på et døgn, 3600 = sekunder på en time. % (rest ved division) giver det, der er tilbage,
// fx (total % 86400) = sekunderne ud over hele døgn.
function splitRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// Klokken lige nu, opdateret hvert sekund (en "custom hook" – en genbrugelig funktion med state).
// Den er null, indtil komponenten kører i browseren, så serveren og browseren ikke er uenige om tiden
// (ellers ville siden vise ét tal fra serveren og et andet, når browseren tager over).
function useNow() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return now;
}

/**
 * En nedtælling.
 *
 * Varianter:
 *   reservation – tid tilbage af reservationen, fx "9:58" (until = reserved_until fra bookingen)
 *   premiere    – Figma "Nedtælling" (node 594:3212): "PREMIERE OM" med bokse for dage, timer, min og sek
 *                 (until = premiere_date, fx "2026-12-20"). Bruges i MovieHero.
 *
 * @param {object} props
 * @param {string} props.until
 * @param {"reservation" | "premiere"} [props.variant="reservation"]
 */
export default function Countdown({ until, variant = "reservation" }) {
  const now = useNow();

  // Premieren starter ved midnat dansk tid på premieredagen (startOfDanishDay i lib/format.js)
  if (variant === "premiere") {
    return <PremiereCountdown start={startOfDanishDay(until)} now={now} />;
  }

  if (now === null) {
    return <p>Dine pladser er reserveret</p>;
  }

  const remaining = new Date(until).getTime() - now;

  if (remaining <= 0) {
    return <p role="alert">Reservationen er udløbet.</p>;
  }

  return (
    <p>
      Dine pladser er reserveret i <time>{formatRemaining(remaining)}</time>
    </p>
  );
}

// De fire bokse i Figma "Nedtælling": key er feltet fra splitRemaining, label er teksten under tallet
const PREMIERE_UNITS = [
  { key: "days", label: "dage" },
  { key: "hours", label: "timer" },
  { key: "minutes", label: "min" },
  { key: "seconds", label: "sek" },
];

function PremiereCountdown({ start, now }) {
  // Indtil browseren kender tiden, viser boksene "--"
  const parts = now === null ? null : splitRemaining(start.getTime() - now);
  return (
    <div className={styles.premiere}>
      <p className={styles.heading}>Premiere om</p>

      {/* Boksene skifter hvert sekund, så skærmlæsere springer dem over (aria-hidden) og får i stedet én kort
          sætning nedenfor. Den læses ikke op igen, hver gang den ændrer sig. */}
      <div className={styles.units} aria-hidden="true">
        {PREMIERE_UNITS.map((unit) => (
          <div key={unit.key} className={styles.unit}>
            {/* padStart(2, "0") giver altid to cifre: 8 → "08" */}
            <span className={styles.value}>{parts ? String(parts[unit.key]).padStart(2, "0") : "--"}</span>
            <span className={styles.label}>{unit.label}</span>
          </div>
        ))}
      </div>
      {/* .visually-hidden (app/globals.css): kun for skærmlæsere */}
      {parts && (
        <p className="visually-hidden">
          {parts.days} dage og {parts.hours} timer
        </p>
      )}
    </div>
  );
}
