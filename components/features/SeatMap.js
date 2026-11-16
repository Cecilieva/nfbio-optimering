"use client";

import { formatSeat } from "@/lib/format";

/**
 * The hall's seats by row. Controlled: the parent keeps the selected ids.
 * Taken seats are disabled. When maxSelected is reached, only selected seats can be clicked.
 *
 * @param {object} props
 * @param {Array<{ number: number, seats: Array<{ id: number, row_number: number, seat_number: number, type: string, taken: boolean }> }>} props.rows From getSeatMap()
 * @param {number[]} props.selectedIds
 * @param {(seatId: number) => void} props.onToggle
 * @param {number} props.maxSelected
 */
export default function SeatMap({ rows, selectedIds, onToggle, maxSelected }) {
  const full = selectedIds.length >= maxSelected;

  return (
    <div role="group" aria-label="Sæder">
      {rows.map((row) => (
        <div key={row.number} data-row={row.number}>
          <span aria-hidden="true">Række {row.number}</span>
          {row.seats.map((seat) => {
            const selected = selectedIds.includes(seat.id);

            return (
              <button
                key={seat.id}
                type="button"
                aria-pressed={selected}
                aria-label={`${formatSeat(seat)}${seat.taken ? ", optaget" : ""}`}
                data-seat-type={seat.type}
                data-taken={seat.taken}
                disabled={seat.taken || (full && !selected)}
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
