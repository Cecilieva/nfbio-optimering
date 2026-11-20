"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Chip from "@/components/ui/Chip";
import FilterField from "@/components/ui/FilterField";
import { addDays, formatDayKey, formatDayMonthShort, formatPremiere, formatWeekday } from "@/lib/format";
import SelectedShowtime from "./SelectedShowtime";
import ShowtimeButton from "./ShowtimeButton";
import StatusDot from "./StatusDot";
import styles from "./ShowtimeList.module.css";

// Skemaet viser 30 dage i alt
const DAYS_AHEAD = 30;

// Man ser 7 dage ad gangen (én uge)
const DAYS_PER_WEEK = 7;

// Spilletiderne nederst på filmsiden (Figma "Spilletider").
// Den består af fire dele, ligesom i Figma:
//   1. Overskrift, format-knapper og biograf-vælger
//   2. Forklaring på de farvede prikker og pilene til næste/forrige uge
//   3. Skemaet med en kolonne for hver dag
//   4. "Din forestilling" - det tidspunkt, man har valgt
//
// Aktuelle film vises fra i dag. Kommende film vises fra premieren.
// Den får filmen (movie), alle filmens spilletider (showtimes) og salenes layout (halls) fra filmsiden.
export default function ShowtimeList({ movie, showtimes, halls }) {
  // Det, brugeren har valgt på siden
  const [cinemaId, setCinemaId] = useState(null); // valgt biograf
  const [format, setFormat] = useState("all"); // valgt format: "all", "2D" eller "4DX"
  const [week, setWeek] = useState(0); // hvilken uge: 0 = første uge, 1 = næste uge
  const [selectedId, setSelectedId] = useState(null); // det tidspunkt, man har klikket på
  const [cinemaOpen, setCinemaOpen] = useState(false); // er biograf-listen åben?

  // Hver 30. sekund henter vi de ledige pladser igen,
  // så prikkerne passer, hvis andre har købt billetter imens.
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(timer);
  }, [router]);

  // ---------- 1) Hvilke dage skal vises? ----------

  const isComing = movie.status === "coming_soon";
  const today = formatDayKey(new Date());

  // Første dag er i dag. Har en kommende film ikke haft premiere endnu, er det premieredagen.
  let firstDay = today;
  if (isComing && movie.premiere_date > today) {
    firstDay = movie.premiere_date;
  }

  // Sidste dag er 30 dage senere
  const lastDay = addDays(firstDay, DAYS_AHEAD - 1);

  // Vi bruger kun spilletider mellem første og sidste dag
  const inPeriod = showtimes.filter((showtime) => showtime.day >= firstDay && showtime.day <= lastDay);

  // Er der ingen spilletider, viser vi en kort tekst i stedet for skemaet
  if (inPeriod.length === 0) {
    let message = "Der er ingen kommende spilletider i din by.";
    if (isComing && movie.premiere_date) {
      message = `Spilletiderne fra premieren ${formatPremiere(movie.premiere_date)} er ikke lagt ud endnu.`;
    }

    return (
      <section className={styles.showtimes}>
        <h2 id="spilletider" className={styles.heading}>
          Spilletider
        </h2>
        <p className={styles.empty}>{message}</p>
      </section>
    );
  }

  // ---------- 2) Biograf og format ----------

  // Lav en liste over biograferne, der viser filmen (hver biograf kun én gang)
  const cinemas = [];
  for (const showtime of inPeriod) {
    const cinema = showtime.hall.cinema;
    const alreadyAdded = cinemas.some((c) => c.id === cinema.id);
    if (!alreadyAdded) {
      cinemas.push(cinema);
    }
  }

  // Find den valgte biograf. Har man ikke valgt en, tager vi den første.
  let cinema = cinemas.find((c) => c.id === cinemaId);
  if (!cinema) {
    cinema = cinemas[0];
  }

  // Kun spilletiderne i den valgte biograf
  const inCinema = inPeriod.filter((showtime) => showtime.hall.cinema.id === cinema.id);

  // Lav en liste over formaterne, fx ["2D", "4DX"] (hvert format kun én gang)
  const formats = [];
  for (const showtime of inCinema) {
    if (!formats.includes(showtime.format)) {
      formats.push(showtime.format);
    }
  }
  formats.sort();

  // Kun spilletiderne i det valgte format ("all" = alle formater)
  const visible = inCinema.filter((showtime) => format === "all" || showtime.format === format);

  // ---------- 3) Ugen, der vises ----------

  // Lav de 7 datoer i ugen. Uge 0 starter på første dag, uge 1 starter 7 dage senere osv.
  const weekDays = [];
  for (let i = 0; i < DAYS_PER_WEEK; i++) {
    weekDays.push(addDays(firstDay, week * DAYS_PER_WEEK + i));
  }
  const firstDayInWeek = weekDays[0];
  const lastDayInWeek = weekDays[weekDays.length - 1];

  // Pilen tilbage er grå i første uge.
  // Pilen frem er grå, hvis der ikke er flere spilletider efter denne uge.
  const isFirstWeek = week === 0;
  const isLastWeek = !visible.some((showtime) => showtime.day > lastDayInWeek);

  // Teksten over hver dag: "Premiere", "I dag" eller ugedagen, fx "Onsdag"
  function dayLabel(day) {
    if (isComing && day === movie.premiere_date) {
      return "Premiere";
    }
    if (day === today) {
      return "I dag";
    }
    return formatWeekday(day);
  }

  // Find spilletiderne på en bestemt dag
  function showtimesOnDay(day) {
    return visible.filter((showtime) => showtime.day === day);
  }

  // ---------- 4) Det valgte tidspunkt ----------

  // Find det tidspunkt, man har klikket på
  let selected = visible.find((showtime) => showtime.id === selectedId);

  // Har man ikke klikket på noget, vælger vi det første ledige tidspunkt i ugen
  if (!selected) {
    selected = visible.find(
      (showtime) =>
        showtime.day >= firstDayInWeek && showtime.day <= lastDayInWeek && showtime.seat_status !== "sold_out",
    );
  }

  // Når man vælger en ny biograf eller et nyt format, starter skemaet forfra i første uge
  function chooseCinema(value) {
    setCinemaId(Number(value));
    setFormat("all");
    setWeek(0);
  }

  function chooseFormat(value) {
    setFormat(value);
    setWeek(0);
  }

  // Biograferne som valgmuligheder i biograf-vælgeren (id'et skal være tekst)
  const cinemaOptions = cinemas.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <section className={styles.showtimes} aria-labelledby="spilletider">
      {/* 1. Overskrift, format-knapper og biograf-vælger */}
      <div className={styles.top}>
        <h2 id="spilletider" className={styles.heading}>
          Spilletider i {cinema.name}
        </h2>

        <div className={styles.filters}>
          {/* Format-knapperne: Alle, 2D, 4DX … */}
          <div className={styles.formats} role="group" aria-label="Format">
            <Chip selected={format === "all"} onClick={() => chooseFormat("all")}>
              Alle
            </Chip>
            {formats.map((f) => (
              <Chip key={f} selected={format === f} onClick={() => chooseFormat(f)}>
                {f}
              </Chip>
            ))}
          </div>

          {/* Biograf-vælgeren */}
          <FilterField
            variant="box"
            label="Biograf"
            options={cinemaOptions}
            value={String(cinema.id)}
            onChange={chooseCinema}
            open={cinemaOpen}
            onOpenChange={setCinemaOpen}
          />
        </div>
      </div>

      {/* 2. Forklaring på prikkerne til venstre og pilene til højre */}
      <div className={styles.week}>
        <ul className={styles.legend}>
          <li className={styles.legendItem}>
            <StatusDot status="available" />
            Ledige pladser
          </li>
          <li className={styles.legendItem}>
            <StatusDot status="few" />
            Få pladser
          </li>
          <li className={styles.legendItem}>
            <StatusDot status="sold_out" />
            Udsolgt
          </li>
        </ul>

        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Forrige uge"
            disabled={isFirstWeek}
            onClick={() => setWeek(week - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Næste uge"
            disabled={isLastWeek}
            onClick={() => setWeek(week + 1)}
          >
            ›
          </button>
        </div>
      </div>

      {/* 3. Skemaet: én kolonne for hver dag */}
      <div className={styles.schedule}>
        {weekDays.map((day) => (
          // Har dagen ingen spilletider, bliver den tonet ned (se CSS-filen)
          <div key={day} className={styles.day} data-empty={showtimesOnDay(day).length === 0}>
            <h3 className={styles.dayHeading}>
              <span className={styles.dayLabel}>{dayLabel(day)}</span>
              <span className={styles.dayDate}>{formatDayMonthShort(day)}</span>
            </h3>

            {showtimesOnDay(day).map((showtime) => (
              <ShowtimeButton
                key={showtime.id}
                showtime={showtime}
                selected={selected && showtime.id === selected.id}
                onSelect={() => setSelectedId(showtime.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 4. "Din forestilling" - vises kun, når der er valgt et tidspunkt */}
      {selected && (
        <SelectedShowtime
          movie={movie}
          showtime={selected}
          hallLayout={halls[selected.hall_id]}
          canBuy={movie.ticket_sale_open}
          ticketSaleOpens={movie.ticket_sale_opens}
        />
      )}
    </section>
  );
}
