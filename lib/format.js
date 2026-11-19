// Små hjælpere, der laver tal og datoer om til pæn dansk tekst.
// Fx bliver 108 til "1 t 48 min", og en dato bliver til "22. december".
// Alle sider bruger dem, så teksten ser ens ud over hele sitet.

// Databasen gemmer klokkeslæt i en tid, der ikke er dansk.
// Derfor siger vi her: vis altid tiden, som den er i Danmark.
const TIME_ZONE = "Europe/Copenhagen";

// Nedenfor laver vi en række "opskrifter" på, hvordan en dato skal skrives.
// "da-DK" betyder: skriv det på dansk.

// Den her opskrift skriver en dato som 2026-11-16 (år-måned-dag).
// Det ser ikke pænt ud, så det vises aldrig for brugeren.
// Vi bruger det kun bag kulisserne til at se, om to datoer er samme dag.
// ("sv-SE" er svensk – vi bruger det kun, fordi svensk tilfældigvis skriver datoer på netop den måde.)
const dayKeyFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });
// Opskrift: "mandag 16. november"
const dayFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});
// Opskrift: "18.00"
const timeFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

// "19. november" – fx premieren på "Kommer snart"-kortet og i fakta på filmsiden
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

// "19. nov" – premieren på plakaterne under "Kommende film".
// Browseren skriver selv "19. nov." med et punktum til sidst. Det punktum fjerner vi.
const dayMonthShortFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

export function formatDayMonthShort(date) {
  // .replace(/\.$/, "") = "fjern punktummet, hvis det står helt til sidst"
  return dayMonthShortFormat.format(new Date(date)).replace(/\.$/, "");
}

// Dagene i "Dato"-filteret på forsiden: "I dag", "I morgen", og ellers fx "Torsdag 12. nov"
const filterDayFormat = new Intl.DateTimeFormat("da-DK", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "short",
});

export function formatFilterDay(date, now = new Date()) {
  // Er det i dag eller i morgen, skriver vi bare det
  const relative = formatCountdown(date, now);
  if (relative === "I dag" || relative === "I morgen") {
    return relative;
  }
  // Browseren skriver "torsdag den 12. nov." – vi fjerner "den" og punktummet til sidst …
  const text = filterDayFormat.format(new Date(date)).replace(" den ", " ").replace(/\.$/, "");
  // … og laver første bogstav stort: "torsdag" → "Torsdag"
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "November" – månedsknapperne under "Kommende film" (med stort forbogstav)
const monthFormat = new Intl.DateTimeFormat("da-DK", { timeZone: TIME_ZONE, month: "long" });

export function formatMonth(date) {
  const month = monthFormat.format(new Date(date));
  return month.charAt(0).toUpperCase() + month.slice(1);
}

// Hvor mange dage er der til premieren?
//   "Om 4 dage", "I morgen" eller "I dag"
// Er premieren allerede overstået, giver den ingenting tilbage (null)
export function formatCountdown(date, now = new Date()) {
  // Vi trækker dagens dato fra premieredatoen.
  // Computeren regner i millisekunder (tusindedele af et sekund),
  // så vi dividerer med antallet af millisekunder på et døgn (86.400.000) for at få antal dage.
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

// Giver datoen som "2026-11-19" (dansk tid).
// Vises aldrig for brugeren – bruges kun til at se, om to tidspunkter er samme dag
export function formatDayKey(date) {
  return dayKeyFormat.format(new Date(date));
}

// Danmark er 1 time foran "verdens-tiden" om vinteren og 2 timer foran om sommeren (sommertid).
// Den her opskrift fortæller os, hvilken af dem der gælder på en bestemt dag: "GMT+01:00" eller "GMT+02:00"
const offsetFormat = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" });

// Finder præcis midnat i Danmark på premieredagen – så nedtællingen ved, hvornår den skal ramme 0.
//   "2026-12-20" → 20. december kl. 00.00 dansk tid
// Vi spørger om tiden kl. 12 midt på dagen, fordi skiftet til og fra sommertid sker om natten.
// Spurgte vi om midnat, kunne vi ramme lige ved skiftet og få den forkerte time.
export function startOfDanishDay(dayKey) {
  // Find ud af, om Danmark er +1 eller +2 timer foran den dag, fx "+01:00"
  const offset = offsetFormat
    .formatToParts(new Date(`${dayKey}T12:00:00Z`))
    .find((part) => part.type === "timeZoneName")
    .value.replace("GMT", "");
  // Sæt det sammen til et tidspunkt, computeren forstår: "2026-12-20T00:00:00+01:00"
  // (= 20. december kl. 00.00, 1 time foran). "Z" er kun en reserve, hvis der ikke er nogen forskel.
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

// Den korte aldersgrænse i den lille boks (filmkort og toppen af filmsiden):
//   "15 år"            → "15+"
//   "Tilladt for alle" → "Alle"
//   ingen censur       → null (så vises boksen ikke)
export function formatAgeShort(ageRating) {
  if (!ageRating) {
    return null;
  }
  // Starter teksten med et tal? Så tag tallet ud, fx "15" fra "15 år"
  const years = ageRating.match(/^(\d+)/);
  if (years) {
    return `${years[1]}+`;
  }
  return ageRating === "Tilladt for alle" ? "Alle" : ageRating;
}

// Censuren i fakta på filmsiden (MovieDetails):
//   "15 år"            → "Fra 15 år"         (sæt "Fra" foran)
//   "Tilladt for alle" → "Tilladt for alle"  (uændret)
//   ingen censur endnu → "Afventer censur"   (typisk kommende film)
export function formatAgeRating(ageRating) {
  if (!ageRating) {
    return "Afventer censur";
  }
  if (ageRating === "Tilladt for alle") {
    return ageRating;
  }
  return `Fra ${ageRating}`;
}

// Filmens længde: 108 minutter → "1 t 48 min". Under en time: 45 → "45 min"
export function formatDuration(minutes) {
  if (!minutes) {
    return null;
  }

  const hours = Math.floor(minutes / 60); // hele timer (rundet ned)
  const rest = minutes % 60; // de minutter der er tilbage

  return hours ? `${hours} t ${rest} min` : `${rest} min`;
}

// En pris: 270 → "270 kr."
export function formatPrice(dkk) {
  return `${dkk} kr.`;
}

// Ét sæde: { row_number: 4, seat_number: 6 } → "Række 4, sæde 6"
export function formatSeat(seat) {
  return `Række ${seat.row_number}, sæde ${seat.seat_number}`;
}

// De valgte sæder som én tekst. Bruges alle steder, hvor sæder vises:
//   række 4 sæde 6 + 7          → "Række 4, sæde 6–7"    (ved siden af hinanden → bindestreg)
//   række 4 sæde 6 + 9          → "Række 4, sæde 6, 9"   (ikke ved siden af → komma)
//   række 4 sæde 6 + 7, række 5 → "Række 4, sæde 6–7 · Række 5, sæde 1"
export function formatSeats(seats) {
  // 1) Saml sæderne pr. række: { 4 → [6, 7], 5 → [1] }
  const rows = new Map();

  for (const seat of seats) {
    if (!rows.has(seat.row_number)) {
      rows.set(seat.row_number, []);
    }

    rows.get(seat.row_number).push(seat.seat_number);
  }

  // 2) Gå rækkerne igennem i rækkefølge (laveste række først)
  return [...rows.keys()]
    .sort((a, b) => a - b)
    .map((row) => {
      const numbers = rows.get(row).sort((a, b) => a - b);
      // 3) Lav sæder der sidder ved siden af hinanden om til "fra–til", fx [6, 7, 8] → [6, 8]
      const ranges = [];

      for (const number of numbers) {
        const last = ranges.at(-1); // den sidste gruppe vi har lavet

        // Sidder sædet lige efter den sidste gruppe? Så udvid gruppen
        if (last && number === last[1] + 1) {
          last[1] = number;
        } else {
          // Ellers start en ny gruppe
          ranges.push([number, number]);
        }
      }

      // 4) Lav grupperne om til tekst: [6, 8] → "6–8", [9, 9] → "9"
      const text = ranges.map(([from, to]) => (from === to ? from : `${from}–${to}`)).join(", ");

      return `Række ${row}, sæde ${text}`;
    })
    // 5) Flere rækker skilles med " · "
    .join(" · ");
}
