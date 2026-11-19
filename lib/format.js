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

// "19. november" – fx premieredatoen på "Kommer snart"-kortet
const premiereFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
});

export function formatPremiere(date) {
  return premiereFormat.format(new Date(date));
}

// "19.11" – den korte premieredato øverst til højre på "Kommer snart"-kortet
const premiereShortFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
});

export function formatPremiereShort(date) {
  return premiereShortFormat.format(new Date(date));
}

// "19. nov" – premieren på plakaterne under "Kommende film". Intl skriver "19. nov.", så punktummet fjernes.
const dayMonthShortFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

export function formatDayMonthShort(date) {
  return dayMonthShortFormat.format(new Date(date)).replace(/\.$/, "");
}

// The days in the "Dato" filter: "I dag", "I morgen", then e.g. "Torsdag 12. nov"
const filterDayFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "short",
});

export function formatFilterDay(date, now = new Date()) {
  const relative = formatCountdown(date, now);
  if (relative === "I dag" || relative === "I morgen") {
    return relative;
  }
  // Intl writes "torsdag den 12. nov." – drop "den" and the last period, and start with a capital letter
  const text = filterDayFormat.format(new Date(date)).replace(" den ", " ").replace(/\.$/, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "November" – månedsfiltrene under "Kommende film"
const monthFormat = new Intl.DateTimeFormat("da-DK", { timeZone: TIME_ZONE, month: "long" });

export function formatMonth(date) {
  const month = monthFormat.format(new Date(date));
  return month.charAt(0).toUpperCase() + month.slice(1);
}

// Days until the premiere, counted in Danish calendar days: "Om 4 dage", "I morgen", "I dag".
// null when the premiere has passed.
export function formatCountdown(date, now = new Date()) {
  // formatDayKey gives "2026-11-19" in Danish time. As UTC midnight the difference is whole days.
  const days = Math.round((Date.parse(formatDayKey(date)) - Date.parse(formatDayKey(now))) / 86_400_000);

  if (days < 0) {
    return null;
  }
  if (days === 0) {
    return "I dag";
  }
  if (days === 1) {
    return "I morgen";
  }
  return `Om ${days} dage`;
}

export function formatDayKey(date) {
  return dayKeyFormat.format(new Date(date));
}

// forskel til UTC: "GMT+01:00" (vinter) / "GMT+02:00" (sommer)
const offsetFormat = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" });

// "2026-12-20" → 20. dec kl. 00:00 dansk tid (premiere-nedtællingen)
// finder forskellen til UTC kl. 12 den dag (så sommertid om natten ikke driller)
// → "2026-12-20T00:00:00+01:00". forskel 0 = bare "GMT" → "Z"
export function startOfDanishDay(dayKey) {
  const offset = offsetFormat
    .formatToParts(new Date(`${dayKey}T12:00:00Z`))
    .find((part) => part.type === "timeZoneName")
    .value.replace("GMT", "");
  return new Date(`${dayKey}T00:00:00${offset || "Z"}`);
}

// "mandag 16. november"
export function formatDay(date) {
  return dayFormat.format(new Date(date));
}

// "18.00"
export function formatTime(date) {
  return timeFormat.format(new Date(date));
}

// The age rating on the film cards: "15 år" → "15+", "Tilladt for alle" → "Alle". null when unknown.
export function formatAgeShort(ageRating) {
  if (!ageRating) {
    return null;
  }
  const years = ageRating.match(/^(\d+)/);
  if (years) {
    return `${years[1]}+`;
  }
  return ageRating === "Tilladt for alle" ? "Alle" : ageRating;
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
