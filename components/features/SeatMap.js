"use client";

import { formatSeat } from "@/lib/format";

// Det skærmlæseren siger om et sæde, fx "Række 4, sæde 6, optaget"
function seatLabel(seat) {
  let label = formatSeat(seat);
  if (seat.taken) {
    label += ", optaget";
  }
  if (seat.out_of_order) {
    label += ", ude af drift";
  }
  return label;
}

// Sæderne i salen, række for række - her vælger man sine pladser.
// rows kommer fra getSeatMap(). Forælderen holder styr på, hvilke sæder der er valgt (selectedIds),
// og onToggle kaldes, når man klikker på et sæde.
// Optagne sæder og sæder ude af drift kan ikke klikkes.
// Har man valgt det antal, man må (maxSelected), kan man kun klikke på dem, man allerede har valgt.
export default function SeatMap({ rows, selectedIds, onToggle, maxSelected }) {
  // Har man valgt nok sæder?
  const full = selectedIds.length >= maxSelected;

  return (
    <div role="group" aria-label="Sæder">
      {rows.map((row) => (
        <div key={row.number} data-row={row.number}>
          <span aria-hidden="true">Række {row.number}</span>
          {row.seats.map((seat) => {
            // Er sædet valgt?
            const selected = selectedIds.includes(seat.id);

            return (
              <button
                key={seat.id}
                type="button"
                aria-pressed={selected}
                aria-label={seatLabel(seat)}
                data-seat-type={seat.type}
                data-taken={seat.taken}
                data-out-of-order={seat.out_of_order}
                disabled={seat.taken || seat.out_of_order || (full && !selected)}
                onClick={() => onToggle(seat.id)}
              >
                {seat.seat_number}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
