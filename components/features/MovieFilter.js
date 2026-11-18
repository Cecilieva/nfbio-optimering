"use client";

import { useCallback, useRef, useState } from "react";
import MovieCard from "@/components/features/MovieCard";
import Chip from "@/components/ui/Chip";
import FilterField from "@/components/ui/FilterField";
import { formatDayKey, formatFilterDay } from "@/lib/format";
import styles from "./MovieFilter.module.css";

// Figma "Formater": knapperne står fast i Figma, så de står også fast her
const FORMATS = ["2D", "3D", "4D", "IMAX", "70MM"];

// "Ekstra filtrering": de punkter, databasen har data til (movies.language, fx "Engelsk tale")
const LANGUAGES = ["Dansk tale", "Engelsk tale"];

// Alle filtre står på "Alle …", når man kommer ind på siden, og når man trykker "Nulstil filter"
const NO_FILTERS = { cinema: "all", day: "all", genre: "all", extra: "all", format: "all" };

/**
 * Filtreringen af de film, der kører nu i byen – og listen med filmene under den.
 * Figma: "Filtrering" (node 2848:14506, komponent "Filtering" 464:12550).
 *
 * Fire felter med dropdown (Biograf, Dato, Genre, Ekstra filtrering), søgeknappen,
 * format-knapperne og "Nulstil filter". Filmene filtreres med det samme, når man vælger noget.
 *
 * @param {object} props
 * @param {string} props.cityName Fx "Aarhus" – står i overskriften
 * @param {{ id: number, name: string }[]} props.cinemas Biograferne i byen (getCinemas)
 * @param {Array<{ id: number, slug: string, title: string, genres?: string[], language?: string,
 *   showtimes: { starts_at: string, format: string, cinema_id: number }[] }>} props.movies Fra getNowPlaying()
 */
export default function MovieFilter({ cityName, cinemas, movies }) {
  // De valgte filtre – ét pr. felt og ét for formatet
  const [filters, setFilters] = useState(NO_FILTERS);

  // Hvilket felt har sin dropdown åben? Kun ét ad gangen ("Aktivt felt" i Figma), eller null
  const [openField, setOpenField] = useState(null);

  // Listen med film – søgeknappen hopper ned til den
  const resultsRef = useRef(null);

  // Sæt ét filter og behold de andre
  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  // Giver hvert felt en funktion, der åbner eller lukker netop det felt.
  // useCallback gør, at funktionen er den samme mellem renders, så FilterField ikke genstarter sin useEffect.
  const openChange = useCallback(
    (key) => (open) => setOpenField((current) => (open ? key : current === key ? null : current)),
    [],
  );

  // ---------- Punkterne i dropdownsene – lavet ud fra de rigtige data ----------

  const cinemaOptions = [
    { value: "all", label: "Alle biografer" },
    ...cinemas.map((cinema) => ({ value: String(cinema.id), label: cinema.name })),
  ];

  // Hver dag med mindst én spilletid: "I dag", "I morgen", "Torsdag 12. nov" …
  const days = new Map();
  for (const movie of movies) {
    for (const showtime of movie.showtimes) {
      const key = formatDayKey(showtime.starts_at);
      if (!days.has(key)) {
        days.set(key, formatFilterDay(showtime.starts_at));
      }
    }
  }
  const dayOptions = [
    { value: "all", label: "Alle datoer" },
    ...[...days].sort(([a], [b]) => a.localeCompare(b)).map(([key, label]) => ({ value: key, label })),
  ];

  // Alle genrer, som filmene har, i alfabetisk rækkefølge
  const genres = [...new Set(movies.flatMap((movie) => movie.genres ?? []))].sort((a, b) => a.localeCompare(b, "da"));
  const genreOptions = [{ value: "all", label: "Alle genrer" }, ...genres.map((genre) => ({ value: genre, label: genre }))];

  const extraOptions = [
    { value: "all", label: "Alle forestillinger" },
    ...LANGUAGES.map((language) => ({ value: language, label: language })),
    { value: "other", label: "Andre tale" },
  ];

  // ---------- Selve filtreringen ----------

  // En spilletid passer, når biograf, dag og format passer – alle tre på samme spilletid
  function showtimeMatches(showtime) {
    return (
      (filters.cinema === "all" || String(showtime.cinema_id) === filters.cinema) &&
      (filters.day === "all" || formatDayKey(showtime.starts_at) === filters.day) &&
      (filters.format === "all" || showtime.format === filters.format)
    );
  }

  // Genre og sprog hører til filmen, ikke til spilletiden
  function movieMatches(movie) {
    if (filters.genre !== "all" && !movie.genres?.includes(filters.genre)) {
      return false;
    }
    if (filters.extra === "other") {
      // "Andre tale": et sprog, der hverken er dansk eller engelsk
      if (!movie.language || LANGUAGES.includes(movie.language)) {
        return false;
      }
    } else if (filters.extra !== "all" && movie.language !== filters.extra) {
      return false;
    }
    return movie.showtimes.some(showtimeMatches);
  }

  const shown = movies.filter(movieMatches);

  // Søgeknappen: luk en åben dropdown og hop ned til filmene.
  // Fokus flytter med, så skærmlæsere og tastatur også lander dér.
  function showResults() {
    setOpenField(null);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    resultsRef.current?.focus({ preventScroll: true });
  }

  // "Nulstil filter": alle felter tilbage på "Alle …"
  function resetFilters() {
    setFilters(NO_FILTERS);
    setOpenField(null);
  }

  // De fire felter i Figmas rækkefølge
  const fields = [
    { key: "cinema", label: "Biograf", options: cinemaOptions },
    { key: "day", label: "Dato", options: dayOptions },
    { key: "genre", label: "Genre", options: genreOptions },
    { key: "extra", label: "Ekstra filtrering", options: extraOptions },
  ];

  return (
    <section className={styles.filter} aria-labelledby="film-der-koerer-nu">
      {/* Figma "Titel" – L/Sekundær/Bold */}
      <h1 id="film-der-koerer-nu" className={styles.title}>
        Film i {cityName} der kører nu
      </h1>

      {/* Figma: baren med de fire felter og søgeknappen */}
      <div className={styles.bar}>
        {fields.map((field, index) => (
          <div key={field.key} className={styles.slot}>
            {/* Figma "Skille" mellem felterne */}
            {index > 0 && <span className={styles.divider} aria-hidden="true" />}
            <FilterField
              label={field.label}
              options={field.options}
              value={filters[field.key]}
              onChange={(value) => setFilter(field.key, value)}
              open={openField === field.key}
              onOpenChange={openChange(field.key)}
            />
          </div>
        ))}

        {/* Den blå søgeknap til højre */}
        <button type="button" className={styles.search} aria-label="Vis film" onClick={showResults}>
          <img src="/icons/search-filter.svg" alt="" width={24} height={24} />
        </button>
      </div>

      {/* Figma: format-knapperne til venstre og "Nulstil filter" til højre */}
      <div className={styles.options}>
        {/* Figma "Formater": en streg før og efter knapperne. role="group" samler dem for skærmlæsere. */}
        <div className={styles.formats} role="group" aria-label="Format">
          <span className={styles.formatDivider} aria-hidden="true" />
          <Chip variant="subtle" selected={filters.format === "all"} onClick={() => setFilter("format", "all")}>
            Alle formater
          </Chip>
          {FORMATS.map((format) => (
            <Chip
              key={format}
              variant="subtle"
              selected={filters.format === format}
              onClick={() => setFilter("format", format)}
            >
              {format}
            </Chip>
          ))}
          <span className={styles.formatDivider} aria-hidden="true" />
        </div>

        <button type="button" className={styles.reset} onClick={resetFilters}>
          <img src="/icons/reset.svg" alt="" width={16} height={16} />
          Nulstil filter
        </button>
      </div>

      {/* Filmene, der passer til filtrene. tabIndex={-1}, så søgeknappen kan flytte fokus hertil. */}
      <div ref={resultsRef} tabIndex={-1} className={styles.results}>
        {/* Læses op for skærmlæsere, hver gang antallet ændrer sig */}
        <p role="status" className={styles.visuallyHidden}>
          {shown.length === 1 ? "1 film" : `${shown.length} film`}
        </p>

        {shown.length > 0 ? (
          <ul className={styles.list}>
            {shown.map((movie) => (
              <li key={movie.id}>
                <MovieCard movie={movie} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Ingen film passer til dine filtre. Prøv at nulstille filteret.</p>
        )}
      </div>
    </section>
  );
}
