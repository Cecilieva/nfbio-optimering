"use client";

import Button from "@/components/ui/Button";
import Seat from "@/components/ui/Seat";
import { MAX_TICKETS, TICKET_TYPES, countTickets, ticketPrice } from "@/lib/ticket-types";
import { formatPrice } from "@/lib/format";
import styles from "./TicketCounter.module.css";

// Kortet, hvor man vælger antal billetter pr. type med plus og minus.
// Under typerne står en blå stol pr. billet, og nederst antal, pris og "Vælg sæder".
//
//   basePriceDkk - prisen for en voksenbillet (showtime.price_dkk)
//   counts       - antal pr. type, fx { adult: 2, child: 0, senior: 0 }. Forælderen gemmer dem.
//   onChange     - kaldes med de nye antal, når man trykker plus eller minus
//   onContinue   - kaldes, når man trykker "Vælg sæder"
export default function TicketCounter({ basePriceDkk, counts, onChange, onContinue }) {
  const { quantity: total, totalDkk } = countTickets(counts, basePriceDkk);

  // Lægger "amount" (1 eller -1) til antallet af én type
  function change(typeId, amount) {
    onChange({ ...counts, [typeId]: counts[typeId] + amount });
  }

  return (
    <div className={styles.card}>
      <ul className={styles.types}>
        {TICKET_TYPES.map((type) => {
          const count = counts[type.id];

          return (
            <li key={type.id} className={styles.type}>
              <div className={styles.typeText}>
                <span>{type.label}</span>
                <span className={styles.small}>{formatPrice(ticketPrice(type, basePriceDkk))}</span>
              </div>

              {/* Minus, antal og plus */}
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.stepperButton}
                  onClick={() => change(type.id, -1)}
                  disabled={count === 0}
                  aria-label={`Færre ${type.label.toLowerCase()}billetter`}
                >
                  −
                </button>
                {/* aria-live: skærmlæseren siger det nye tal, når det ændrer sig */}
                <span className={styles.count} aria-live="polite">
                  {count}
                </span>
                <button
                  type="button"
                  className={styles.stepperButton}
                  onClick={() => change(type.id, 1)}
                  disabled={total >= MAX_TICKETS}
                  aria-label={`Flere ${type.label.toLowerCase()}billetter`}
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Én stol pr. billet - kun til pynt, tallet står nedenfor */}
      {total > 0 && (
        <div className={styles.seats} aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <Seat key={index} state="selected" />
          ))}
        </div>
      )}

      <div className={styles.bottom}>
        <div className={styles.typeText}>
          <span>
            {total} {total === 1 ? "billet" : "billetter"} · {formatPrice(totalDkk)}
          </span>
          <span className={styles.small}>Du vælger sæder i næste trin</span>
        </div>
        <Button onClick={onContinue} disabled={total === 0}>
          Vælg sæder
        </Button>
      </div>
    </div>
  );
}
