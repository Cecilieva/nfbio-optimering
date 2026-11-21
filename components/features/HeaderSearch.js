// "use client" betyder, at komponenten kører i browseren.
// Det er nødvendigt, fordi feltet åbner og lukker og viser resultater, mens man skriver.
"use client";

import Image from "next/image";
import Link from "next/link";
import LinkLoader from "@/components/features/LinkLoader";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import TextField from "@/components/ui/TextField";
import styles from "./HeaderSearch.module.css";

// Så mange film vises højst i listen
const MAX_RESULTS = 8;

// Små og store bogstaver tæller ikke med, når vi sammenligner
function normalize(text) {
  return text.toLocaleLowerCase("da").trim();
}

/**
 * Søgningen efter film. Et klik på ikonet åbner et søgefelt, og filmene, der passer, vises under feltet,
 * mens man skriver. Bruges to steder (se variant).
 * Pil op/ned flytter markeringen i listen, Enter åbner den markerede film (eller den første).
 * Et klik på ikonet igen, Escape eller et klik udenfor lukker feltet.
 *
 * Feltet er en "combobox": fokus bliver i feltet, mens man bladrer med piletasterne, og
 * aria-activedescendant fortæller skærmlæsere, hvilken film der er markeret.
 *
 * @param {object} props
 * @param {{ id: number, title: string, slug: string, poster_url?: string }[]} props.movies
 *   Filmene, man kan søge i (fra getSearchMovies)
 * @param {"header" | "filter"} [props.variant] "header": feltet folder sig ud til venstre for ikonet i headeren.
 *   "filter": den blå søgeknap i filtreringen på /film - et panel med feltet og filmene åbner under knappen
 * @param {string} [props.className] Ekstra stil til boksen om knap og felt (fx dens plads i filtreringsbaren)
 * @param {string} [props.triggerClassName] Stilen til ikon-knappen
 */
export default function HeaderSearch({ movies, variant = "header", className, triggerClassName }) {
  const isFilter = variant === "filter";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Den film, der er markeret med piletasterne (-1 = ingen)
  const [activeIndex, setActiveIndex] = useState(-1);
  // Et unikt id til listen, så feltet kan pege på den og på den markerede film
  const listId = useId();
  // Håndtag til knappen og hele søgningen (knap + felt), så vi kan flytte fokus og se, om et klik er udenfor
  const triggerRef = useRef(null);
  const wrapperRef = useRef(null);

  // De film, hvis titel indeholder det, man har skrevet
  const search = normalize(query);
  const results = search
    ? movies
        .filter((movie) => normalize(movie.title).includes(search))
        .slice(0, MAX_RESULTS)
    : [];

  // Går til en film og lukker søgningen
  function openMovie(movie) {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    router.push(`/film/${movie.slug}`);
  }

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    // Fokus tilbage på ikonet, så tastaturbrugere ikke mister deres plads
    triggerRef.current?.focus();
  }

  // Et klik udenfor søgningen lukker den (kun mens den er åben).
  // Ikonet tæller som indenfor - det lukker selv feltet med toggle() nedenfor
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Ikonet åbner feltet - og lukker det igen, hvis det allerede er åbent
  function toggle() {
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      close();
    }
  }

  // Piletasterne i feltet flytter markeringen op og ned i listen (og hopper rundt i enderne)
  function handleFieldKeyDown(event) {
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    }
  }

  // Den markerede film skal kunne ses, også når listen er scrollet
  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId]);

  // Enter åbner den markerede film - eller den første, hvis ingen er markeret
  function handleSubmit(event) {
    event.preventDefault();
    if (results.length > 0) {
      openMovie(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  }

  return (
    // Feltet placeres i forhold til denne boks (se CSS'en)
    <div
      ref={wrapperRef}
      className={className ? `${styles.wrapper} ${className}` : styles.wrapper}
      data-variant={variant}
      onKeyDown={handleKeyDown}
    >
      {/* Søge-ikonet */}
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={isFilter ? "Søg efter film" : "Søg"}
        aria-expanded={open}
        onClick={toggle}
      >
        <Image src={isFilter ? "/icons/search-filter.svg" : "/icons/search.svg"} alt="" width={24} height={24} />
      </button>

      {open && (
        // Header: feltet folder sig ud til venstre for ikonet. Filter: panelet åbner under knappen.
        <div className={styles.panel} data-search-open>
          <form role="search" onSubmit={handleSubmit}>
            <TextField
              label="Søg efter film"
              hideLabel
              name={isFilter ? "filter-search" : "header-search"}
              type="search"
              placeholder={isFilter ? undefined : "Søg efter film"}
              autoComplete="off"
              enterKeyHint="search"
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleFieldKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
              className={styles.field}
            />
          </form>

          {/* Resultaterne vises først, når man har skrevet noget */}
          {/* Skærmlæsere får at vide, hvor mange film der passer. Feltet findes, så længe søgningen er åben -
              ellers når skærmlæseren ikke at opdage det, før teksten ændrer sig første gang */}
          <p className="visually-hidden" aria-live="polite">
            {search && (results.length === 1 ? "1 film fundet" : `${results.length} film fundet`)}
          </p>

          {search && (
            <div className={styles.results}>
              {results.length > 0 ? (
                <ul id={listId} role="listbox" aria-label="Film" className={styles.list}>
                  {results.map((movie, index) => (
                    <li
                      key={movie.id}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      // Musen markerer også en film, så mus og piletaster viser det samme
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      {/* Linket kan ikke nås med Tab - man bruger piletasterne i feltet i stedet */}
                      <Link
                        href={`/film/${movie.slug}`}
                        className={styles.item}
                        tabIndex={-1}
                        data-active={index === activeIndex || undefined}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                          setActiveIndex(-1);
                        }}
                      >
                        {/* Plakaten - eller en tom boks, hvis filmen ikke har en */}
                        {movie.poster_url ? (
                          <img src={movie.poster_url} alt="" className={styles.poster} />
                        ) : (
                          <span className={styles.poster} aria-hidden="true" />
                        )}
                        {/* Kun titlen - ingen anden tekst */}
                        <span className={styles.title}>{movie.title}</span>
                        {/* På vej ind på en filmside vises loaderen altid (som filmkortene) */}
                        <LinkLoader always />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>
                  Ingen film matcher “{query.trim()}”
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
