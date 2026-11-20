import { Fragment } from "react";
import Seat from "@/components/ui/Seat";
import styles from "./HallMap.module.css";

// Overblik over salen (Figma "Sal/1" … "Sal/7"). Vises, når man klikker "Se salen".
// Man kan ikke vælge sæder her - det gør man først i næste trin.
//
// Salen er bygget som et grid: rækkenummeret står i begge sider,
// og hvert sæde står i sin egen kolonne (col). Er der ingen sæde i en kolonne, bliver det en gang.
//
// Den får:
//   name         - salens navn, fx "Bio 5"
//   layout       - fra getHallLayouts(): { columns, rows: [{ number, seats: [...] }] }
//   freeSeats    - antal ledige pladser (fra getShowtimes)
//   takenSeatIds - id'erne på de sæder, der er taget til forestillingen
export default function HallMap({ name, layout, freeSeats, takenSeatIds }) {
  // Hvilke slags sæder har salen? Forklaringen nederst viser kun dem, der findes
  let hasWheelchair = false;
  for (const row of layout.rows) {
    for (const seat of row.seats) {
      if (seat.type === "handicap") hasWheelchair = true;
    }
  }

  // Kolonnerne i griddet: rækkenummer | sæderne | rækkenummer
  const lastColumn = layout.columns + 2;

  return (
    <div className={styles.hall}>
      {/* Salens navn og antal ledige pladser */}
      <div className={styles.header}>
        <p className={styles.name}>{name}</p>
        <p className={styles.free}>{freeSeats} ledige pladser</p>
      </div>

      {/* Lærredet øverst */}
      <p className={styles.screenLabel}>LÆRRED</p>
      <div className={styles.screen} aria-hidden="true">
        <img src="/icons/seats/screen-glow.svg" alt="" className={styles.screenGlow} />
        <img src="/icons/seats/screen-line.svg" alt="" className={styles.screenLine} />
      </div>

      {/* Selve salen - den er kun til at se på, så skærmlæsere springer den over */}
      <div className={styles.scroll}>
        <div className={styles.grid} style={{ "--hall-columns": layout.columns }} aria-hidden="true">
          {layout.rows.map((row, index) => {
            const gridRow = index + 1;

            return (
              <Fragment key={row.number}>
                {/* Rækkenummeret til venstre */}
                <span className={styles.rowLabel} style={{ gridRow, gridColumn: 1 }}>
                  {row.number}
                </span>

                {row.seats.map((seat) => {
                  const isTaken = takenSeatIds.includes(seat.id);
                  // "+ 1", fordi den første kolonne er rækkenummeret
                  const position = { gridRow, gridColumn: seat.col + 1 };

                  return (
                    <Seat
                      key={seat.id}
                      state={isTaken ? "taken" : "free"}
                      wheelchair={seat.type === "handicap"}
                      className={styles.seat}
                      style={position}
                    />
                  );
                })}

                {/* Rækkenummeret til højre */}
                <span
                  className={`${styles.rowLabel} ${styles.rowLabelRight}`}
                  style={{ gridRow, gridColumn: lastColumn }}
                >
                  {row.number}
                </span>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Forklaringen nederst - "Ledig" og "Optaget" er der altid, resten kun hvis salen har dem */}
      <ul className={styles.legend}>
        <li className={styles.legendItem}>
          <Seat className={styles.seat} />
          Ledig
        </li>
        <li className={styles.legendItem}>
          <Seat state="taken" className={styles.seat} />
          Optaget
        </li>
        {hasWheelchair && (
          <li className={styles.legendItem}>
            <Seat wheelchair className={styles.seat} />
            Kørestolsplads
          </li>
        )}
      </ul>
    </div>
  );
}
