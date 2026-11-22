// "use client": søgningen kører i browseren, fordi den viser resultater, mens man skriver
"use client";

import Image from "next/image";
import Link from "next/link";
import LinkLoader from "@/components/features/loading/LinkLoader";
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

// Søgning efter film. Ikonet åbner et felt, og filmene, der passer, vises, mens man skriver.
// Pil op/ned flytter markeringen, Enter åbner filmen. Escape, ikonet eller et klik udenfor lukker.
// Skærmlæsere får den markerede film at vide via aria-activedescendant.
//
//   movies           - filmene, man kan søge i (fra getSearchMovies)
//   className        - ekstra stil til boksen om knap og felt
//   triggerClassName - stilen til ikon-knappen
export default function HeaderSearch({ movies, className, triggerClassName }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Den film, der er markeret med piletasterne (-1 = ingen)
  const [activeIndex, setActiveIndex] = useState(-1);
  // Id til listen, så feltet kan pege på den markerede film
  const listId = useId();
  // Til at flytte fokus og se, om et klik er udenfor
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
    // Fokus tilbage på ikonet, så man ikke mister sin plads med tastaturet
    triggerRef.current?.focus();
  }

  // Et klik udenfor lukker søgningen. Ikonet lukker selv med toggle()
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

  // Piletasterne flytter markeringen (og hopper rundt i enderne)
  function handleFieldKeyDown(event) {
    if (results.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    }
  }

  // Den markerede film scrolles frem
  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }
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
    // Feltet placeres i forhold til denne boks
    <div
      ref={wrapperRef}
      className={className ? `${styles.wrapper} ${className}` : styles.wrapper}
      onKeyDown={handleKeyDown}
    >
      {/* Søge-ikonet */}
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label="Søg"
        aria-expanded={open}
        onClick={toggle}
      >
        <Image src="/icons/search.svg" alt="" width={24} height={24} />
      </button>

      {open && (
        // Feltet ligger til venstre for ikonet
        <div className={styles.panel} data-search-open>
          <form role="search" onSubmit={handleSubmit}>
            <TextField
              label="Søg efter film"
              hideLabel
              name="header-search"
              type="search"
              placeholder="Søg efter film"
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
          {/* Skærmlæsere hører, hvor mange film der passer. Står der hele tiden, så første ændring bliver læst op */}
          <p className="visually-hidden" aria-live="polite">
            {search && (results.length === 1 ? "1 film fundet" : `${results.length} film fundet`)}
          </p>

          {search && (
            // data-lenis-prevent: Lenis (den bløde scroll) rører ikke scrollen i listen, så siden ikke scroller med
            <div className={styles.results} data-lenis-prevent>
              {results.length > 0 ? (
                <ul id={listId} role="listbox" aria-label="Film" className={styles.list}>
                  {results.map((movie, index) => (
                    <li
                      key={movie.id}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      // Musen markerer også filmen
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      {/* Ikke med Tab – man bruger piletasterne */}
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
                        {/* Plakaten – eller en tom boks */}
                        {movie.poster_url ? (
                          <img src={movie.poster_url} alt="" className={styles.poster} />
                        ) : (
                          <span className={styles.poster} aria-hidden="true" />
                        )}
                        {/* Kun titlen */}
                        <span className={styles.title}>{movie.title}</span>
                        {/* Loaderen vises altid på vej ind på en filmside */}
                        <LinkLoader always />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>
                  Ingen film passer til “{query.trim()}”
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
