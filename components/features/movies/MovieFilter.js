"use client";

import { useCallback, useState } from "react";
import MovieCard from "./MovieCard";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import FilterField from "@/components/ui/FilterField";
import { formatDayKey, formatFilterDay } from "@/lib/format";
import styles from "./MovieFilter.module.css";

// Figma "Formater": knapperne står fast i Figma, så de står også fast her
const FORMATS = ["2D", "3D", "4DX", "70MM"];

// "Ekstra filtrering": punkterne, delt i grupperne Forestillinger, Sprog og Undertekster.
//   language – filmens sprog (movies.language)
//   other    – "Andre tale": et sprog, der hverken er dansk eller engelsk
//   tag      – forestillingens kendetegn (showtimes.tags), fx Babybio
const LANGUAGES = ["Dansk tale", "Engelsk tale"];
// Punkterne står i tre grupper med en lille overskrift over hver (group)
const EXTRAS = [
  { value: "Babybio", type: "tag", group: "Forestillinger" },
  { value: "Hjernevenlig Bio", type: "tag", group: "Forestillinger" },
  { value: "Filmklub", type: "tag", group: "Forestillinger" },
  { value: "Liveshow", type: "tag", group: "Forestillinger" },
  { value: "Fangalla", type: "tag", group: "Forestillinger" },
  { value: "Fan forpremiere", type: "tag", group: "Forestillinger" },
  { value: "Dansk tale", type: "language", group: "Sprog" },
  { value: "Engelsk tale", type: "language", group: "Sprog" },
  { value: "Andre tale", type: "other", group: "Sprog" },
  { value: "Dansk undertekst", type: "tag", group: "Undertekster" },
  { value: "Ingen undertekster", type: "tag", group: "Undertekster" },
]

// Passer filmen (sprog) eller spilletiden (kendetegn) til punktet i "Ekstra filtrering"?
function movieHasLanguage(movie, extra) {
  if (extra.type === "other") {
    return Boolean(movie.language) && !LANGUAGES.includes(movie.language);
  }
  return extra.type !== "language" || movie.language === extra.value;
}

function showtimeHasTag(showtime, extra) {
  return extra.type !== "tag" || showtime.tags.includes(extra.value);
}

// Der vises altid mindst 10 film (2 rækker á 5). "Se flere film" viser 10 mere ad gangen.
const PAGE_SIZE = 10;

// Alle filtre står på "Alle …", når man kommer ind på siden, og når man trykker "Nulstil filter"
const NO_FILTERS = { cinema: "all", day: "all", genre: "all", extra: "all", film: "all", format: "all" };

/**
 * Filtreringen af de film, der kører nu i byen – og listen med filmene under den.
 * Figma: "Filtrering" (komponent "Filtering").
 *
 * Fem felter med dropdown (Biograf, Dato, Genre, Ekstra filtrering, Film), format-knapperne og "Nulstil filter".
 * Filmene filtreres med det samme, når man vælger noget. "Film" har et søgefelt i dropdownen, så man hurtigt
 * kan finde en bestemt film – den navigerer ikke, den filtrerer bare listen (søgningen i headeren åbner filmen).
 * Under filtrene står filmene som plakater – Figma "Program".
 *
 * @param {object} props
 * @param {string} props.cityName Fx "Aarhus" – står i overskriften
 * @param {{ id: number, name: string }[]} props.cinemas Biograferne i byen (getCinemas)
 * @param {Array<{ id: number, slug: string, title: string, poster_url?: string, genres?: string[], language?: string,
 *   showtimes: { starts_at: string, format: string, cinema_id: number }[] }>} props.movies Fra getNowPlaying()
 */
export default function MovieFilter({ cityName, cinemas, movies }) {
  // De valgte filtre – ét pr. felt og ét for formatet
  const [filters, setFilters] = useState(NO_FILTERS);

  // Hvilket felt har sin dropdown åben? Kun ét ad gangen ("Aktivt felt" i Figma), eller null
  const [openField, setOpenField] = useState(null);

  // Hvor mange film der vises – "Se flere film" lægger PAGE_SIZE til
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sæt ét filter og behold de andre. Listen starter forfra med 10 film, når filtrene ændres.
  // Passer den valgte film ikke længere til de andre filtre (fx en dato, hvor den ikke kører),
  // går "Film" tilbage til "Alle film" – så listen aldrig bliver tom på grund af filmen.
  function setFilter(key, value) {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (next.film !== "all" && !movies.some((movie) => String(movie.id) === next.film && movieMatches(movie, next))) {
        next.film = "all";
      }
      return next;
    });
    setVisibleCount(PAGE_SIZE);
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

  // Kun de punkter, der findes mindst én forestilling med i byen – så giver et punkt aldrig nul film
  const extraOptions = [
    { value: "all", label: "Alle forestillinger" },
    ...EXTRAS.filter((extra) =>
      movies.some(
        (movie) => movieHasLanguage(movie, extra) && movie.showtimes.some((showtime) => showtimeHasTag(showtime, extra)),
      ),
    ).map((extra) => ({ value: extra.value, label: extra.value, group: extra.group })),
  ];

  // ---------- Selve filtreringen ----------
  // Funktionerne får filtrene med, så setFilter også kan bruge dem på de nye filtre

  // En spilletid passer, når biograf, dag, format og kendetegn (fx Babybio) passer – alle på samme spilletid
  function showtimeMatches(showtime, current = filters) {
    const extra = EXTRAS.find((item) => item.value === current.extra);
    return (
      (current.cinema === "all" || String(showtime.cinema_id) === current.cinema) &&
      (current.day === "all" || formatDayKey(showtime.starts_at) === current.day) &&
      (current.format === "all" || showtime.format === current.format) &&
      (!extra || showtimeHasTag(showtime, extra))
    );
  }

  // Alle filtre undtagen "Film". Genre og sprog hører til filmen, ikke til spilletiden.
  function movieMatches(movie, current = filters) {
    if (current.genre !== "all" && !movie.genres?.includes(current.genre)) {
      return false;
    }
    const extra = EXTRAS.find((item) => item.value === current.extra);
    if (extra && !movieHasLanguage(movie, extra)) {
      return false;
    }
    return movie.showtimes.some((showtime) => showtimeMatches(showtime, current));
  }

  // Filmene, der passer til de andre filtre – det er dem, man kan vælge i "Film"
  const matching = movies.filter((movie) => movieMatches(movie));

  // "Film": alle film, der passer, i alfabetisk rækkefølge med plakaten foran titlen
  const filmOptions = [
    { value: "all", label: "Alle film" },
    ...[...matching]
      .sort((a, b) => a.title.localeCompare(b.title, "da"))
      .map((movie) => ({ value: String(movie.id), label: movie.title, image: movie.poster_url ?? null })),
  ];

  const shown = filters.film === "all" ? matching : matching.filter((movie) => String(movie.id) === filters.film);

  // Antallet ved "Nulstil filter": "24 film" uden filtre, "3 af 24 film", når der er filtreret
  const isFiltered = Object.keys(NO_FILTERS).some((key) => filters[key] !== NO_FILTERS[key]);
  const countText = isFiltered ? `${shown.length} af ${movies.length} film` : `${movies.length} film`;
  // Kun de første film vises, indtil man trykker "Se flere film"
  const visible = shown.slice(0, visibleCount);

  // Er der flere film, end der vises?
  const hasMore = shown.length > visible.length;

  // Formaterne i hjørnet af kortet: det valgte format – ellers alle filmens formater
  // (fra de spilletider, der passer), i samme rækkefølge som knapperne, fx ["2D", "3D", "4DX"]
  function formatsFor(movie) {
    if (filters.format !== "all") {
      return [filters.format];
    }
    const formats = movie.showtimes.filter((showtime) => showtimeMatches(showtime)).map((showtime) => showtime.format);
    return FORMATS.filter((format) => formats.includes(format));
  }

  // "Nulstil filter": alle felter tilbage på "Alle …"
  function resetFilters() {
    setFilters(NO_FILTERS);
    setOpenField(null);
    setVisibleCount(PAGE_SIZE);
  }

  // De fem felter. "Film" står sidst, hvor søgeknappen stod før, og har et søgefelt i dropdownen.
  const fields = [
    { key: "cinema", label: "Biograf", options: cinemaOptions },
    { key: "day", label: "Dato", options: dayOptions },
    { key: "genre", label: "Genre", options: genreOptions },
    { key: "extra", label: "Ekstra filtrering", options: extraOptions },
    {
      key: "film",
      label: "Film",
      options: filmOptions,
      searchable: "Søg efter film",
      emptyText: "Ingen film passer til dine andre filtre.",
    },
  ];

  return (
    <section className={styles.filter} aria-labelledby="film-der-koerer-nu">
      {/* Figma "Titel" – L/Sekundær/Bold */}
      <h1 id="film-der-koerer-nu" className={styles.title}>
        Film i {cityName} der kører nu
      </h1>

      {/* Figma: baren med felterne */}
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
              searchable={field.searchable}
              emptyText={field.emptyText}
            />
          </div>
        ))}
      </div>

      {/* Figma: format-knapperne til venstre og "Nulstil filter" til højre */}
      <div className={styles.options}>
        {/* Figma "Formater": knapperne med 8px imellem. role="group" samler dem for skærmlæsere. */}
        <div className={styles.formats} role="group" aria-label="Format">
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
        </div>

        {/* Antallet og "Nulstil filter". role="status": skærmlæsere hører antallet, hver gang det ændrer sig */}
        <div className={styles.actions}>
          <p role="status" className={styles.count}>
            {countText}
          </p>
          <button type="button" className={styles.reset} onClick={resetFilters}>
            <img src="/icons/reset.svg" alt="" width={16} height={16} />
            Nulstil filter
          </button>
        </div>
      </div>

      {/* Filmene, der passer til filtrene */}
      <div className={styles.results}>
        {/* Figma "Filmgitter": plakaterne – variant "feed" er Figmas "card i feed" */}
        {shown.length > 0 ? (
          <ul className={styles.grid}>
            {visible.map((movie) => (
              <li key={movie.id}>
                <MovieCard movie={movie} variant="feed" formats={formatsFor(movie)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Ingen film passer til dine filtre. Prøv at nulstille filteret.</p>
        )}

        {/* Figma "Se mere": vises kun, når der er flere film, end der står på siden. Man kan kun se flere – ikke færre. */}
        {hasMore && (
          <Button
            variant="more"
            className={styles.more}
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Se flere film
          </Button>
        )}
      </div>
    </section>
  );
}
