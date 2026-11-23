"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { formatDayKey, formatDayMonthShort, formatTime } from "@/lib/format";
import { getSpecialShowtime, getSubtitleTags } from "@/lib/showtime-tags";
import HallMap from "./HallMap";
import styles from "./SelectedShowtime.module.css";

// Boksen "Din forestilling" under skemaet - viser det tidspunkt, man har valgt.
//   "Se salen"       - folder salen ud (HallMap), så man kan se hvilke sæder der er taget
//   "Vælg billetter" - går videre til sædevalget
// Den vises kun, når billetsalget er åbent (ellers viser ShowtimeList kortet "Billetsalg lukket").
// hallLayout er salens sæder fra getHallLayouts(). Har vi den ikke, viser vi ikke "Se salen".
export default function SelectedShowtime({ movie, showtime, hallLayout }) {
  // Er salen foldet ud?
  const [hallOpen, setHallOpen] = useState(false);

  // "I dag", hvis forestillingen er i dag - ellers datoen, fx "22. dec"
  const isToday = showtime.day === formatDayKey(new Date());
  const day = isToday ? "I dag" : formatDayMonthShort(showtime.starts_at);

  // Særforestillingen, fx Babybio – eller null
  const special = getSpecialShowtime(showtime.tags);

  // Teksten under titlen, fx "Sal 7 · 2D · Engelsk tale · Dansk undertekst · Babybio · Slut ca. kl. 20.28"
  const details = [showtime.hall.name, showtime.format];
  if (movie.language) {
    details.push(movie.language);
  }
  details.push(...getSubtitleTags(showtime.tags));
  if (special) {
    details.push(special.tag);
  }
  if (movie.duration_min) {
    // Sluttid = starttid + filmens længde. Tiden er i millisekunder, derfor "* 60 * 1000"
    const endsAt = new Date(showtime.starts_at).getTime() + movie.duration_min * 60 * 1000;
    details.push(`Slut ca. kl. ${formatTime(endsAt)}`);
  }

  return (
    <section className={styles.bar} aria-label="Din forestilling">
      <div className={styles.top}>
        {/* Den lille plakat */}
        {movie.poster_url && <img src={movie.poster_url} alt="" className={styles.poster} />}

        <div className={styles.text}>
          <p className={styles.label}>Din forestilling</p>
          <p className={styles.title}>
            {movie.title} · {day} kl. {formatTime(showtime.starts_at)}
          </p>
          <p className={styles.details}>{details.join(" · ")}</p>
          {/* Hvad særforestillingen betyder, fx "Babybio: Forestilling for forældre med babyer …" */}
          {special && (
            <p className={styles.special}>
              <span className={styles.specialName}>{special.tag}:</span> {special.text}
            </p>
          )}
        </div>

        <div className={styles.buttons}>
          {hallLayout && (
            // samme kant som "Se flere film"
            <Button variant="more" aria-expanded={hallOpen} onClick={() => setHallOpen(!hallOpen)}>
              {hallOpen ? "Skjul salen" : "Se salen"}
              {/* Pilen peger ned, når salen er skjult, og op, når den er vist */}
              <img
                src={hallOpen ? "/icons/chevron-up.svg" : "/icons/chevron-down.svg"}
                alt=""
                width={16}
                height={11}
                className={styles.chevron}
              />
            </Button>
          )}

          <Button href={`/bestil/saeder/${showtime.id}`}>Vælg billetter</Button>
        </div>
      </div>

      {/* Salen - kun når man har klikket "Se salen" */}
      {hallOpen && hallLayout && (
        <div className={styles.hall}>
          <HallMap
            name={showtime.hall.name}
            layout={hallLayout}
            freeSeats={showtime.free_seats}
            takenSeatIds={showtime.taken_seat_ids}
          />
          <div className={styles.hallText}>
            <p className={styles.hallTitle}>Overblik over salen</p>
            <p className={styles.hallHint}>Du vælger selv pladser i næste trin.</p>
          </div>
        </div>
      )}
    </section>
  );
}
