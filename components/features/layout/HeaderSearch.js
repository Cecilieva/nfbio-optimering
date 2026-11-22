// "use client": søgningen kører i browseren, fordi den viser resultater, mens man skriver
"use client";

import Image from "next/image";
import Link from "next/link";
import LinkLoader from "@/components/features/loading/LinkLoader";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import TextField from "@/components/ui/TextField";
import styles from "./HeaderSearch.module.css";

// Så mange resultater vises højst i listen – og så mange af dem er altid biografer (hvis der er nogen, der passer),
// så biograferne ikke bliver skubbet ud af en lang liste film
const MAX_RESULTS = 8;
const MAX_CINEMAS = 3;

// Små og store bogstaver tæller ikke med, når vi sammenligner
function normalize(text) {
  return text.toLocaleLowerCase("da").trim();
}

// Søgning efter film og biografer. Ikonet åbner et felt, og det, der passer, vises, mens man skriver.
// Under hver titel står en lille kategori: "Film" eller "Biograf · Aarhus", så man kan se, hvad det er
// (og hvilken by en biograf ligger i).
// Filmene står først, så biograferne. En biograf findes både på navn og by.
// Pil op/ned flytter markeringen, Enter åbner den. Escape, ikonet eller et klik udenfor lukker.
// Skærmlæsere får det markerede resultat at vide via aria-activedescendant.
//
//   movies           - filmene, man kan søge i (fra getSearchMovies)
//   cinemas          - biograferne i hele landet (fra getSearchCinemas)
//   className        - ekstra stil til boksen om knap og felt
//   triggerClassName - stilen til ikon-knappen
export default function HeaderSearch({ movies, cinemas = [], className, triggerClassName }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Det resultat, der er markeret med piletasterne (-1 = ingen)
  const [activeIndex, setActiveIndex] = useState(-1);
  // Id til listen, så feltet kan pege på det markerede resultat
  const listId = useId();
  // Til at flytte fokus og se, om et klik er udenfor
  const triggerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Film og biografer i én liste: titel, kategori, link og billede
  const items = [
    ...movies.map((movie) => ({
      key: `film-${movie.id}`,
      category: "Film",
      title: movie.title,
      href: `/film/${movie.slug}`,
      image: movie.poster_url,
      words: movie.title,
    })),
    ...cinemas.map((cinema) => ({
      key: `biograf-${cinema.id}`,
      category: `Biograf · ${cinema.city}`,
      title: cinema.name,
      href: `/biografer/${cinema.slug}`,
      image: cinema.image_url,
      // En biograf findes også på byen, fx "Aarhus" finder Trøjborg
      words: `${cinema.name} ${cinema.city}`,
    })),
  ];

  // Det, hvis navn indeholder det, man har skrevet: filmene først og biograferne under.
  // Biograferne får op til MAX_CINEMAS pladser, filmene resten.
  const search = normalize(query);
  const matches = search ? items.filter((item) => normalize(item.words).includes(search)) : [];
  const cinemaMatches = matches.filter((item) => item.category !== "Film").slice(0, MAX_CINEMAS);
  const filmMatches = matches.filter((item) => item.category === "Film").slice(0, MAX_RESULTS - cinemaMatches.length);
  // Er der færre film, får biograferne de ledige pladser
  const results = [
    ...filmMatches,
    ...matches.filter((item) => item.category !== "Film").slice(0, MAX_RESULTS - filmMatches.length),
  ];

  // Går til et resultat og lukker søgningen
  function openItem(item) {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    router.push(item.href);
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

  // Det markerede resultat scrolles frem
  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId]);

  // Enter åbner det markerede resultat - eller det første, hvis intet er markeret
  function handleSubmit(event) {
    event.preventDefault();
    if (results.length > 0) {
      openItem(results[activeIndex >= 0 ? activeIndex : 0]);
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
              label="Søg efter film og biografer"
              hideLabel
              name="header-search"
              type="search"
              placeholder="Søg efter film og biografer"
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
          {/* Skærmlæsere hører, hvor mange der passer. Står der hele tiden, så første ændring bliver læst op */}
          <p className="visually-hidden" aria-live="polite">
            {search && (results.length === 1 ? "1 resultat fundet" : `${results.length} resultater fundet`)}
          </p>

          {search && (
            // data-lenis-prevent: Lenis (den bløde scroll) rører ikke scrollen i listen, så siden ikke scroller med
            <div className={styles.results} data-lenis-prevent>
              {results.length > 0 ? (
                <ul id={listId} role="listbox" aria-label="Film og biografer" className={styles.list}>
                  {results.map((item, index) => (
                    <li
                      key={item.key}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      // Musen markerer også resultatet
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      {/* Ikke med Tab – man bruger piletasterne */}
                      <Link
                        href={item.href}
                        className={styles.item}
                        tabIndex={-1}
                        data-active={index === activeIndex || undefined}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                          setActiveIndex(-1);
                        }}
                      >
                        {/* Plakaten eller biografens billede – eller en tom boks */}
                        {item.image ? (
                          <img src={item.image} alt="" className={styles.poster} />
                        ) : (
                          <span className={styles.poster} aria-hidden="true" />
                        )}
                        {/* Titlen og kategorien under hinanden */}
                        <span className={styles.text}>
                          <span className={styles.title}>{item.title}</span>
                          <span className={styles.category}>{item.category}</span>
                        </span>
                        {/* Loaderen vises altid på vej ind på en filmside */}
                        <LinkLoader always={item.category === "Film"} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>Ingen film eller biografer passer til “{query.trim()}”</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
