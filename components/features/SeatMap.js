"use client";

import { Fragment } from "react";
import Seat from "@/components/ui/Seat";
import { formatSeat } from "@/lib/format";
import styles from "./SeatMap.module.css";

// Det skærmlæseren siger om et sæde, fx "Række 4, sæde 6, optaget"
function seatLabel(seat) {
  let label = formatSeat(seat);
  if (seat.type === "handicap") {
    label += ", handicapplads";
  }
  if (seat.taken) {
    label += ", optaget";
  }
  return label;
}

// Salen, hvor man vælger sine pladser: lærredet, sæderne række for række og en forklaring.
// Salen er et grid ligesom "Se salen" (HallMap): hvert sæde står i sin egen kolonne (col),
// og en kolonne uden sæde bliver en gang.
//
//   rows        - fra getSeatMap()
//   selectedIds - de sæder, man har valgt. Forælderen holder styr på dem
//   onToggle    - kaldes med sædets id, når man klikker på et sæde (forælderen bestemmer, hvad der sker)
// Optagne sæder kan ikke klikkes - alle andre kan altid klikkes.
export default function SeatMap({ rows, selectedIds, onToggle }) {
  // Hvor bred er salen, og hvilke slags sæder har den? Forklaringen viser kun dem, der findes
  let columns = 0;
  let hasWheelchair = false;
  for (const row of rows) {
    for (const seat of row.seats) {
      if (seat.col > columns) columns = seat.col;
      if (seat.type === "handicap") hasWheelchair = true;
    }
  }

  return (
    <div className={styles.hall}>
      {/* Lærredet øverst */}
      <p className={styles.screenLabel} aria-hidden="true">
        LÆRRED
      </p>
      <div className={styles.screen} aria-hidden="true">
        <img src="/icons/seats/screen-glow.svg" alt="" className={styles.screenGlow} />
        <img src="/icons/seats/screen-line.svg" alt="" className={styles.screenLine} />
      </div>

      {/* Sæderne. En stor sal kan scrolles til siden på mobil */}
      <div className={styles.scroll}>
        <div role="group" aria-label="Sæder" className={styles.grid} style={{ "--hall-columns": columns }}>
          {rows.map((row, index) => {
            const gridRow = index + 1;

            return (
              <Fragment key={row.number}>
                {/* Rækkenummeret til venstre - skærmlæseren får det med i hvert sæde */}
                <span className={styles.rowLabel} style={{ gridRow, gridColumn: 1 }} aria-hidden="true">
                  {row.number}
                </span>

                {row.seats.map((seat) => {
                  const selected = selectedIds.includes(seat.id);

                  // Hvilken farve skal sædet have?
                  let state = "free";
                  if (seat.taken) state = "taken";
                  if (selected) state = "selected";

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      className={styles.seatButton}
                      // "+ 1", fordi den første kolonne er rækkenummeret
                      style={{ gridRow, gridColumn: seat.col + 1 }}
                      aria-pressed={selected}
                      aria-label={seatLabel(seat)}
                      disabled={seat.taken}
                      onClick={() => onToggle(seat.id)}
                    >
                      <Seat state={state} wheelchair={seat.type === "handicap"} className={styles.seat} />
                    </button>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Forklaringen nederst. Den er kun til at se på - skærmlæseren får det at vide i hvert sæde */}
      <ul className={styles.legend} aria-hidden="true">
        <li className={styles.legendItem}>
          <Seat className={styles.seat} />
          Ledig
        </li>
        <li className={styles.legendItem}>
          <Seat state="selected" className={styles.seat} />
          Dit valg
        </li>
        <li className={styles.legendItem}>
          <Seat state="taken" className={styles.seat} />
          Optaget
        </li>
        {hasWheelchair && (
          <li className={styles.legendItem}>
            <Seat wheelchair className={styles.seat} />
            Handicapplads
          </li>
        )}
      </ul>
    </div>
  );
}
