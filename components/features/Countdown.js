"use client";

import { useEffect, useState } from "react";
import { startOfDanishDay } from "@/lib/format";
import styles from "./Countdown.module.css";

function formatRemaining(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

// ms → { days, hours, minutes, seconds }
// Math.max(0, …) så det aldrig går i minus
// 86400 sek = døgn, 3600 = time, % = resten
function splitRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// tiden nu, hvert sekund (custom hook)
// null indtil browseren kører → server og browser er ikke uenige om tiden
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
 * Nedtælling
 *
 *   reservation – tid tilbage, fx "9:58" (until = reserved_until)
 *   premiere    – "PREMIERE OM" + 4 bokse (until = premiere_date). Bruges i MovieHero
 *
 * @param {object} props
 * @param {string} props.until
 * @param {"reservation" | "premiere"} [props.variant="reservation"]
 */
export default function Countdown({ until, variant = "reservation" }) {
  const now = useNow();

  // premiere = midnat dansk tid (startOfDanishDay)
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

// de 4 bokse – key fra splitRemaining, label under tallet
const PREMIERE_UNITS = [
  { key: "days", label: "dage" },
  { key: "hours", label: "timer" },
  { key: "minutes", label: "min" },
  { key: "seconds", label: "sek" },
];

function PremiereCountdown({ start, now }) {
  // "--" indtil browseren har tiden
  const parts = now === null ? null : splitRemaining(start.getTime() - now);
  return (
    <div className={styles.premiere}>
      <p className={styles.heading}>Premiere om</p>

      {/* skifter hvert sek → aria-hidden, skærmlæsere får én sætning i stedet */}
      <div className={styles.units} aria-hidden="true">
        {PREMIERE_UNITS.map((unit) => (
          <div key={unit.key} className={styles.unit}>
            {/* 8 → "08" */}
            <span className={styles.value}>{parts ? String(parts[unit.key]).padStart(2, "0") : "--"}</span>
            <span className={styles.label}>{unit.label}</span>
          </div>
        ))}
      </div>
      {/* kun skærmlæsere */}
      {parts && (
        <p className="visually-hidden">
          {parts.days} dage og {parts.hours} timer
        </p>
      )}
    </div>
  );
}
