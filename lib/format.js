// Formatting shared by pages and components. Danish text, Danish time.

// Showtimes are stored in UTC, so we always show them in Danish time
const TIME_ZONE = "Europe/Copenhagen";

// sv-SE writes dates as 2026-11-16, which we use as the key for each day
const dayKeyFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });
const dayFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const timeFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDayKey(date) {
  return dayKeyFormat.format(new Date(date));
}

// "mandag 16. november"
export function formatDay(date) {
  return dayFormat.format(new Date(date));
}

// "18.00"
export function formatTime(date) {
  return timeFormat.format(new Date(date));
}

// 108 → "1 t 48 min"
export function formatDuration(minutes) {
  if (!minutes) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return hours ? `${hours} t ${rest} min` : `${rest} min`;
}

// 270 → "270 kr."
export function formatPrice(dkk) {
  return `${dkk} kr.`;
}

// { row_number: 4, seat_number: 6 } → "Række 4, sæde 6"
export function formatSeat(seat) {
  return `Række ${seat.row_number}, sæde ${seat.seat_number}`;
}

// The selected seats as one text, used everywhere seats are shown:
// [4/6, 4/7]      → "Række 4, sæde 6–7"   (next to each other: a range)
// [4/6, 4/9]      → "Række 4, sæde 6, 9"  (not next to each other: commas)
// [4/6, 4/7, 5/1] → "Række 4, sæde 6–7 · Række 5, sæde 1"
export function formatSeats(seats) {
  const rows = new Map();

  for (const seat of seats) {
    if (!rows.has(seat.row_number)) {
      rows.set(seat.row_number, []);
    }

    rows.get(seat.row_number).push(seat.seat_number);
  }

  return [...rows.keys()]
    .sort((a, b) => a - b)
    .map((row) => {
      const numbers = rows.get(row).sort((a, b) => a - b);
      const ranges = [];

      for (const number of numbers) {
        const last = ranges.at(-1);

        if (last && number === last[1] + 1) {
          last[1] = number;
        } else {
          ranges.push([number, number]);
        }
      }

      const text = ranges.map(([from, to]) => (from === to ? from : `${from}–${to}`)).join(", ");

      return `Række ${row}, sæde ${text}`;
    })
    .join(" · ");
}
