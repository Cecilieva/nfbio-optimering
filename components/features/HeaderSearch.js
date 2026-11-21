// "use client" betyder, at komponenten kører i browseren.
// Det er nødvendigt, fordi feltet åbner og lukker og viser resultater, mens man skriver.
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TextField from "@/components/ui/TextField";
import styles from "./HeaderSearch.module.css";

// Så mange film vises højst i listen
const MAX_RESULTS = 8;

// Små og store bogstaver tæller ikke med, når vi sammenligner
function normalize(text) {
  return text.toLocaleLowerCase("da").trim();
}

/**
 * Søgningen i headeren. Et klik på ikonet folder et søgefelt ud til venstre for ikonet, og filmene,
 * der passer, vises under feltet, mens man skriver. Enter går til den første film.
 * Et klik på ikonet igen, Escape eller et klik udenfor lukker feltet.
 *
 * @param {object} props
 * @param {{ id: number, title: string, slug: string, poster_url?: string, comingSoon: boolean }[]} props.movies
 *   Filmene, man kan søge i (fra getSearchMovies)
 * @param {string} [props.triggerClassName] Headerens stil til ikon-knappen
 */
export default function HeaderSearch({ movies, triggerClassName }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  function close() {
    setOpen(false);
    setQuery("");
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

  // Enter går til den første film på listen
  function handleSubmit(event) {
    event.preventDefault();
    if (results.length > 0) {
      setOpen(false);
      setQuery("");
      router.push(`/film/${results[0].slug}`);
    }
  }

  return (
    // Feltet placeres i forhold til denne boks: lige til venstre for ikonet (se CSS'en)
    <div ref={wrapperRef} className={styles.wrapper} onKeyDown={handleKeyDown}>
      {/* Ikonet i headeren */}
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
        // Feltet folder sig ud til venstre for ikonet
        <div className={styles.panel} data-search-open>
          <form role="search" className={styles.row} onSubmit={handleSubmit}>
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
              onChange={(event) => setQuery(event.target.value)}
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
                <ul className={styles.list}>
                  {results.map((movie) => (
                    <li key={movie.id}>
                      <Link
                        href={`/film/${movie.slug}`}
                        className={styles.item}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                      >
                        {/* Plakaten - eller en tom boks, hvis filmen ikke har en */}
                        {movie.poster_url ? (
                          <img
                            src={movie.poster_url}
                            alt=""
                            className={styles.poster}
                          />
                        ) : (
                          <span className={styles.poster} aria-hidden="true" />
                        )}
                        <span className={styles.text}>
                          <span className={styles.title}>{movie.title}</span>
                          {movie.comingSoon && (
                            <span className={styles.meta}>Kommer snart</span>
                          )}
                        </span>
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
