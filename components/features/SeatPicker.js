"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import BottomBar from "@/components/features/BottomBar";
import SeatMap from "@/components/features/SeatMap";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Overlay from "@/components/ui/Overlay";
import { reserveSeats } from "@/lib/actions/booking";
import { formatPrice, formatSeats } from "@/lib/format";

const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Seat selection: choose the number of tickets → choose the seats → reserve.
 * While reserving: "Vi popper dine pladser". If a seat was taken: "Dine popkorn blev brændt".
 *
 * @param {object} props
 * @param {{ id: number, price_dkk: number }} props.showtime
 * @param {Array} props.rows From getSeatMap()
 */
export default function SeatPicker({ showtime, rows }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [state, formAction, pending] = useActionState(reserveSeats, null);
  // The error the user has closed, so the overlay stays closed until the next error
  const [dismissed, setDismissed] = useState(null);

  const seatTaken = state?.error?.code === "SEAT_TAKEN" && dismissed !== state;
  const otherError = state?.error && state.error.code !== "SEAT_TAKEN" ? state.error : null;
  const selectedSeats = rows
    .flatMap((row) => row.seats)
    .filter((seat) => selectedIds.includes(seat.id));

  function chooseQuantity(value) {
    setQuantity(value);
    setSelectedIds((ids) => ids.slice(0, value));
  }

  function toggleSeat(seatId) {
    setSelectedIds((ids) =>
      ids.includes(seatId) ? ids.filter((id) => id !== seatId) : [...ids, seatId],
    );
  }

  function chooseOtherSeats() {
    setDismissed(state);
    setSelectedIds([]);
    // Fetch the seat map again, so the seat that was taken shows as taken
    router.refresh();
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="showtime_id" value={showtime.id} />
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="seat_id" value={id} />
      ))}

      <h2>Hvor mange billetter?</h2>
      <div role="group" aria-label="Antal billetter">
        {QUANTITIES.map((value) => (
          <Chip key={value} selected={quantity === value} onClick={() => chooseQuantity(value)}>
            {value}
          </Chip>
        ))}
      </div>

      {quantity && (
        <>
          <h2>Vælg sæder</h2>
          <SeatMap
            rows={rows}
            selectedIds={selectedIds}
            onToggle={toggleSeat}
            maxSelected={quantity}
          />
        </>
      )}

      {otherError && <p role="alert">{otherError.message}</p>}

      <BottomBar
        summary={
          quantity
            ? `${selectedIds.length} af ${quantity} sæder · ${formatPrice(quantity * showtime.price_dkk)}`
            : "Vælg antal billetter"
        }
      >
        <Button type="submit" disabled={!quantity || selectedIds.length !== quantity || pending}>
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
