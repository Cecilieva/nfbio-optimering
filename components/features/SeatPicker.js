"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import BottomBar from "@/components/features/BottomBar";
import SeatMap from "@/components/features/SeatMap";
import StepHeader from "@/components/features/StepHeader";
import TicketCounter from "@/components/features/TicketCounter";
import Button from "@/components/ui/Button";
import Overlay from "@/components/ui/Overlay";
import { reserveSeats } from "@/lib/actions/booking";
import { formatPrice, formatSeats } from "@/lib/format";
import { countTickets } from "@/lib/ticket-types";
import styles from "./SeatPicker.module.css";

// Vi starter med 2 voksne
const START_COUNTS = { adult: 2, child: 0, senior: 0 };

// Købets to første trin på samme side:
//   1. "Vælg antal pladser" (TicketCounter) - hvor mange billetter af hver type
//   2. "Vælg dine pladser" (SeatMap) - vælg sæderne og reservér
// Mens vi reserverer: "Vi popper dine pladser". Var et sæde taget: "Dine popkorn blev brændt".
//
//   showtime - fra getShowtime()
//   rows     - fra getSeatMap()
//   subtitle - underteksten i trin-headeren, fx "Clayface · i dag kl. 19.30 · Aarhus Bio"
//   backHref - "Tilbage" på første trin (filmsiden)
export default function SeatPicker({ showtime, rows, subtitle, backHref }) {
  const router = useRouter();
  // "count" = vælg antal, "seats" = vælg sæder
  const [phase, setPhase] = useState("count");
  const [counts, setCounts] = useState(START_COUNTS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [state, formAction, pending] = useActionState(reserveSeats, null);
  // Den fejl, man har lukket - så bliver overlayet lukket indtil næste fejl
  const [dismissed, setDismissed] = useState(null);

  const seatTaken = state?.error?.code === "SEAT_TAKEN" && dismissed !== state;
  const otherError = state?.error && state.error.code !== "SEAT_TAKEN" ? state.error : null;
  const selectedSeats = rows
    .flatMap((row) => row.seats)
    .filter((seat) => selectedIds.includes(seat.id));

  const { quantity, totalDkk } = countTickets(counts, showtime.price_dkk);

  // Nyt antal: har man allerede valgt for mange sæder, beholder vi kun de første
  function changeCounts(newCounts) {
    setCounts(newCounts);
    setSelectedIds((ids) => ids.slice(0, countTickets(newCounts, showtime.price_dkk).quantity));
  }

  // Skift trin og start øverst på siden
  function goTo(newPhase) {
    setPhase(newPhase);
    window.scrollTo({ top: 0 });
  }

  function toggleSeat(seatId) {
    setSelectedIds((ids) =>
      ids.includes(seatId) ? ids.filter((id) => id !== seatId) : [...ids, seatId],
    );
  }

  function chooseOtherSeats() {
    setDismissed(state);
    setSelectedIds([]);
    // Hent salen igen, så sædet, der blev taget, vises som optaget
    router.refresh();
  }

  // Trin 1: vælg antal
  if (phase === "count") {
    return (
      <div className={styles.picker}>
        <StepHeader step={1} title="Vælg antal pladser" subtitle={subtitle} backHref={backHref} />
        <div className={styles.counter}>
          <TicketCounter
            basePriceDkk={showtime.price_dkk}
            counts={counts}
            onChange={changeCounts}
            onContinue={() => goTo("seats")}
          />
        </div>
      </div>
    );
  }

  // Trin 2: vælg sæder
  return (
    <form action={formAction} className={styles.picker}>
      <input type="hidden" name="showtime_id" value={showtime.id} />
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="seat_id" value={id} />
      ))}

      <StepHeader step={2} title="Vælg dine pladser" subtitle={subtitle} onBack={() => goTo("count")} />

      <SeatMap rows={rows} selectedIds={selectedIds} onToggle={toggleSeat} maxSelected={quantity} />

      {otherError && <p role="alert">{otherError.message}</p>}

      <BottomBar summary={`${selectedIds.length} af ${quantity} sæder · ${formatPrice(totalDkk)}`}>
        <Button type="submit" disabled={selectedIds.length !== quantity || pending}>
          Reservér
        </Button>
      </BottomBar>

      <Overlay open={pending} title="Vi popper dine pladser …">
        <p>{formatSeats(selectedSeats)}</p>
      </Overlay>

      <Overlay open={seatTaken} role="alert" title="Dine popkorn blev brændt">
        <p>{state?.error?.message}</p>
        <p>Du valgte: {formatSeats(selectedSeats)}</p>
        <Button onClick={chooseOtherSeats}>Vælg andre sæder</Button>
      </Overlay>
    </form>
  );
}
