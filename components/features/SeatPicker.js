"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import BottomBar from "@/components/features/BottomBar";
import Countdown from "@/components/features/Countdown";
import SeatMap from "@/components/features/SeatMap";
import SeatView from "@/components/features/SeatView";
import StepHeader from "@/components/features/StepHeader";
import TicketCounter from "@/components/features/TicketCounter";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Overlay from "@/components/ui/Overlay";
import Seat from "@/components/ui/Seat";
import { reserveSeats } from "@/lib/actions/booking";
import { formatSeats } from "@/lib/format";
import { findBestSeats, findLoneSeats } from "@/lib/seat-rules";
import { countTickets } from "@/lib/ticket-types";
import styles from "./SeatPicker.module.css";

// Vi starter med 2 voksne
const START_COUNTS = { adult: 2, child: 0, senior: 0 };

// Så længe tæller uret i bundbjælken ned (samme tid som reserved_until i databasen)
const HOLD_MINUTES = 10;

// Købets to første trin på samme side:
//   1. "Vælg antal pladser" (TicketCounter) - hvor mange billetter af hver type
//   2. "Vælg dine pladser" (SeatMap + SeatView) - vælg sæderne og reservér med "Til betaling".
//      Uret i bundbjælken starter her. Pladserne holdes først rigtigt i databasen efter "Til betaling"
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
  // Hvornår uret i bundbjælken når 00:00. Sættes, når man kommer til sædevalget
  const [holdUntil, setHoldUntil] = useState(null);
  const [state, formAction, pending] = useActionState(reserveSeats, null);
  // Den fejl, man har lukket - så bliver overlayet lukket indtil næste fejl
  const [dismissed, setDismissed] = useState(null);
  // Det valg, man lukkede "En plads står alene"-vinduet for
  const [closedLoneKey, setClosedLoneKey] = useState(null);

  const seatTaken = state?.error?.code === "SEAT_TAKEN" && dismissed !== state;
  const otherError = state?.error && state.error.code !== "SEAT_TAKEN" ? state.error : null;
  const selectedSeats = rows
    .flatMap((row) => row.seats)
    .filter((seat) => selectedIds.includes(seat.id));

  const { quantity, totalDkk } = countTickets(counts, showtime.price_dkk);

  // Sæder, som valget efterlader helt alene. Så kan man ikke gå videre (se lib/seat-rules.js)
  const loneSeats = findLoneSeats(rows, selectedIds, quantity);
  // Vinduet "En plads står alene" åbner af sig selv, når valget efterlader et sæde alene
  // (medmindre der ikke er nogen anden mulighed - se findLoneSeats).
  // Lukker man det, forbliver det lukket, indtil man vælger noget andet (eller trykker "Til betaling")
  const selectionKey = [...selectedIds].sort((a, b) => a - b).join("-");
  const loneOpen = loneSeats.length > 0 && closedLoneKey !== selectionKey;

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

  // Til sædevalget: uret starter forfra, og man får de bedste pladser midt i salen (kan ændres bagefter)
  function goToSeats() {
    setHoldUntil(new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString());
    setSelectedIds(findBestSeats(rows, quantity).map((seat) => seat.id));
    goTo("seats");
  }

  // Klik på et valgt sæde fravælger det. Klik på et ledigt sæde vælger det -
  // har man allerede nok, bytter det med det sæde, man valgte først
  function toggleSeat(seatId) {
    setSelectedIds((ids) => {
      if (ids.includes(seatId)) {
        return ids.filter((id) => id !== seatId);
      }
      if (ids.length >= quantity) {
        return [...ids.slice(1), seatId];
      }
      return [...ids, seatId];
    });
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
            onContinue={goToSeats}
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

      {/* Salen til venstre og "Udsigt fra sædet" til højre */}
      <div className={styles.seats}>
        <SeatMap rows={rows} selectedIds={selectedIds} onToggle={toggleSeat} />
        <SeatView seats={selectedSeats} rows={rows} quantity={quantity} totalDkk={totalDkk}>
          <Button
            type="submit"
            disabled={selectedIds.length !== quantity || pending}
            onClick={(event) => {
              // Efterlader valget et sæde alene, viser vi vinduet i stedet for at gå videre
              if (loneSeats.length > 0) {
                event.preventDefault();
                setClosedLoneKey(null);
              }
            }}
          >
            Til betaling
          </Button>
        </SeatView>
      </div>

      {otherError && (
        <p role="alert" className={styles.error}>
          {otherError.message}
        </p>
      )}

      <BottomBar
        summary={
          <>
            <Seat state="selected" />
            {selectedSeats.length > 0
              ? formatSeats(selectedSeats)
              : `Vælg ${quantity} ${quantity === 1 ? "sæde" : "sæder"} i salen`}
          </>
        }
      >
        {holdUntil && <Countdown until={holdUntil} />}
      </BottomBar>

      {/* Samme vindue som traileren: "Luk", klik udenfor eller Escape lukker det */}
      <Modal
        open={loneOpen}
        onClose={() => setClosedLoneKey(selectionKey)}
        title={loneSeats.length === 1 ? "En plads står alene" : "Pladser står alene"}
        size="small"
      >
        <p>
          Ryk dine pladser, så {formatSeats(loneSeats)} ikke står {loneSeats.length === 1 ? "tom" : "tomme"}.
        </p>
      </Modal>

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
