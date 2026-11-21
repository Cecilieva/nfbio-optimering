"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import FormLoader from "@/components/features/loading/FormLoader";
import BottomBar from "@/components/features/checkout/BottomBar";
import Countdown from "@/components/features/checkout/Countdown";
import SeatMap from "./SeatMap";
import SeatView from "./SeatView";
import StepHeader from "@/components/features/checkout/StepHeader";
import TicketCounter from "./TicketCounter";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Overlay from "@/components/ui/Overlay";
import Seat from "@/components/ui/Seat";
import { reserveSeats } from "@/lib/actions/booking";
import { formatSeats } from "@/lib/format";
import { findBestSeats, findLoneSeats } from "@/lib/seat-rules";
import { countTickets, TICKET_TYPES } from "@/lib/ticket-types";
import { useSubmitOnce } from "@/lib/use-submit-once";
import styles from "./SeatPicker.module.css";

// Vi starter med 2 voksne
const START_COUNTS = { adult: 2, child: 0, senior: 0 };

// Så længe tæller uret i bundbjælken ned (samme tid som reserved_until i databasen)
const HOLD_MINUTES = 10;

// Et nyt ur: tidspunktet om 10 minutter, fx "2026-11-21T12:40:00.000Z"
function newHoldUntil() {
  return new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();
}

// Id'erne på de bedste ledige pladser midt i salen (se findBestSeats i lib/seat-rules.js)
function bestSeatIds(rows, quantity) {
  return findBestSeats(rows, quantity).map((seat) => seat.id);
}

// Købets to første trin på samme side:
//   1. "Vælg antal pladser" (TicketCounter) - hvor mange billetter af hver type
//   2. "Vælg dine pladser" (SeatMap + SeatView) - vælg sæderne og reservér med "Til betaling".
//      Uret i bundbjælken starter her. Pladserne holdes først rigtigt i databasen efter "Til betaling"
// Er et sæde lige blevet taget af en anden, vises "Dine popkorn blev brændt".
//
//   showtime - fra getShowtime()
//   rows     - fra getSeatMap()
//   subtitle - underteksten i trin-headeren, fx "Clayface · i dag kl. 19.30 · Aarhus Bio"
//   backHref - "Tilbage" på første trin (filmsiden)
//   resume   - ens reservation, når man kommer tilbage fra "Dine oplysninger".
//              Så starter vi på "Vælg dine pladser" med de samme sæder, billetter og ur
//   restart  - ens udløbne reservation, når man kommer fra "Tiden er udløbet".
//              Så starter vi på "Vælg dine pladser" med de samme billetter, men nye pladser og et nyt ur
export default function SeatPicker({ showtime, rows, subtitle, backHref, resume, restart }) {
  const router = useRouter();
  // Den reservation, vi tager billetterne fra (den aktive eller den udløbne)
  const previous = resume ?? restart;
  // Kommer man tilbage, men vi ved ikke hvilke billettyper man valgte, tæller vi dem alle som voksen
  const startCounts =
    previous?.tickets ?? (previous ? { ...START_COUNTS, adult: previous.seat_ids.length } : START_COUNTS);

  // "count" = vælg antal, "seats" = vælg sæder. Har man en reservation, starter man på sæderne
  const [phase, setPhase] = useState(previous ? "seats" : "count");
  const [counts, setCounts] = useState(startCounts);
  // Aktiv reservation: de samme sæder. Udløbet: de bedste ledige pladser. Ellers: ingen endnu
  const [selectedIds, setSelectedIds] = useState(() => {
    if (resume) return resume.seat_ids;
    if (restart) return bestSeatIds(rows, countTickets(startCounts, showtime.price_dkk).quantity);
    return [];
  });
  // Hvornår uret i bundbjælken når 00:00. Aktiv reservation: samme ur. Udløbet: et nyt ur
  const [holdUntil, setHoldUntil] = useState(() => {
    if (resume) return resume.reserved_until;
    if (restart) return newHoldUntil();
    return null;
  });
  const [state, formAction, pending] = useActionState(reserveSeats, null);
  // Stopper dobbeltklik
  const submitOnce = useSubmitOnce(pending);
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
    setHoldUntil(newHoldUntil());
    setSelectedIds(bestSeatIds(rows, quantity));
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
    <form action={formAction} onSubmit={submitOnce} className={styles.picker}>
      <input type="hidden" name="showtime_id" value={showtime.id} />
      {/* Hvornår uret når 00:00 - så det går videre på de næste sider i stedet for at starte forfra */}
      {holdUntil && <input type="hidden" name="hold_until" value={holdUntil} />}
      {/* Den reservation, man kom tilbage fra - så kan reserveSeats genbruge eller frigive den */}
      {resume && <input type="hidden" name="booking_id" value={resume.id} />}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="seat_id" value={id} />
      ))}
      {/* Antal pr. billettype, fx ticket_adult = 2 - så "Din ordre" kan vise "2 × Voksen" */}
      {TICKET_TYPES.map((type) => (
        <input key={type.id} type="hidden" name={`ticket_${type.id}`} value={counts[type.id]} />
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

      <Overlay open={seatTaken} role="alert" title="Dine popkorn blev brændt">
        <p>{state?.error?.message}</p>
        <p>Du valgte: {formatSeats(selectedSeats)}</p>
        <Button onClick={chooseOtherSeats}>Vælg andre sæder</Button>
      </Overlay>
      {/* Viser "Indlæser", mens formularen sendes */}
      <FormLoader />
    </form>
  );
}
