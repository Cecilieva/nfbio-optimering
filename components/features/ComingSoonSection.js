// "use client": komponenten kører i browseren, fordi den skal huske, hvad brugeren klikker på (useState)
"use client";

import { useEffect, useRef, useState } from "react";
import MovieCard from "@/components/features/MovieCard";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { formatMonth } from "@/lib/format";
import styles from "./ComingSoonSection.module.css";

// Rul hen til et element og flyt fokus dertil, så man ikke mister sin plads med tastatur eller skærmlæser.
// Bruger man "mindre bevægelse" i styresystemet, hopper siden i stedet for at glide.
function scrollToAndFocus(element) {
  if (!element) {
    return;
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  // preventScroll: rulningen klarer scrollIntoView – ellers ville focus() hoppe derhen med det samme
  element.focus({ preventScroll: true });
}

/**
 * "Kommende film" på forsiden.
 * Figma: "Kommende film – udfold" (node 2221:15159) og prototypen "Forside – samlet" (node 1856:79051).
 *
 * Knappen og sektionen står to forskellige steder på siden, som i prototypen:
 *   1. Knappen "Se alle kommende film" står øverst, lige under de fremhævede film (2848:14500).
 *   2. Det, komponenten får som children (filtreringen og filmene, der kører nu), står i midten.
 *   3. Sektionen med overskrift, filtre og plakater (2849:14585) folder sig ud nederst, under children.
 * Når man trykker på knappen, folder sektionen sig ud, og siden ruller ned til den.
 * "Skjul kommende film" folder den sammen igen og ruller op til knappen.
 *
 * Filmene hentes på siden med getComingSoon() og kommer ind som props –
 * komponenten taler aldrig selv med databasen. Se docs/kommende-film.md.
 *
 * @param {object} props
 * @param {Array<{ id: number, slug: string, title: string, poster_url?: string, premiere_date?: string,
 *   ticket_sale_opens?: string | null, ticket_sale_open: boolean }>} props.movies Fra getComingSoon()
 * @param {React.ReactNode} [props.children] Det, der står mellem knappen og sektionen
 */
export default function ComingSoonSection({ movies, children }) {
  // Er sektionen foldet ud? Den starter lukket, så man kun ser knappen.
  const [open, setOpen] = useState(false);

  // Det valgte filter: "all" (Alle), en måned som "2026-11" eller "presale" (Forsalg åben)
  const [filter, setFilter] = useState("all");

  // Referencer til overskriften og knappen, så vi kan rulle og flytte fokus hen til dem
  const headingRef = useRef(null);
  const openButtonRef = useRef(null);

  // Hvor skal vi hen, når sektionen er foldet ud eller sammen? "section", "button" eller null.
  // Vi kan først rulle ned til sektionen, når React har vist den – derfor sker det i useEffect nedenfor.
  const scrollTarget = useRef(null);

  // Når sektionen er foldet ud eller sammen: rul til sektionen eller knappen
  useEffect(() => {
    if (!scrollTarget.current) {
      return;
    }
    scrollToAndFocus(scrollTarget.current === "section" ? headingRef.current : openButtonRef.current);
    scrollTarget.current = null;
  }, [open]);

  // Knappen øverst: fold sektionen ud og rul ned til den.
  // Er den allerede åben, ruller vi bare ned til den igen.
  function showSection() {
    if (open) {
      scrollToAndFocus(headingRef.current);
      return;
    }
    scrollTarget.current = "section";
    setOpen(true);
  }

  // "Skjul kommende film": fold sektionen sammen og rul op til knappen igen
  function hideSection() {
    scrollTarget.current = "button";
    setOpen(false);
  }

  // Ét filter pr. måned, hvor en film har premiere – i samme rækkefølge som filmene.
  // Nøglen er år og måned fra datoen ("2026-11-19" → "2026-11"), teksten er månedens navn ("November").
  // Kommer der film i en ny måned, kommer der automatisk en ny knap.
  const months = [];
  for (const movie of movies) {
    const key = movie.premiere_date?.slice(0, 7);
    // Tilføj kun måneden, hvis den ikke allerede er på listen
    if (key && !months.some((month) => month.key === key)) {
      months.push({ key, label: formatMonth(movie.premiere_date) });
    }
  }

  // Alle knapperne i Figmas rækkefølge: "Alle", månederne og til sidst "Forsalg åben"
  const filters = [
    { key: "all", label: "Alle" },
    ...months,
    { key: "presale", label: "Forsalg åben" },
  ];

  // De film, der passer til det valgte filter
  const shown = movies.filter((movie) => {
    if (filter === "all") {
      return true;
    }
    if (filter === "presale") {
      // ticket_sale_open regnes ud i getComingSoon() ud fra datoerne i lib/data/ticket-sale.js
      return movie.ticket_sale_open;
    }
    // Et månedsfilter: premieren skal starte med fx "2026-11"
    return movie.premiere_date?.startsWith(filter);
  });

  return (
    <>
      {/* 1. Knappen øverst. Den bliver stående, også når sektionen er åben (som i prototypen).
          aria-expanded fortæller skærmlæsere, om sektionen er foldet ud, og aria-controls peger på den. */}
      <div className={styles.closed}>
        <Button
          ref={openButtonRef}
          variant="secondary"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="kommende-film-sektion"
          onClick={showSection}
        >
          Se alle kommende film
        </Button>
      </div>

      {/* 2. Det, der står imellem – på forsiden er det filtreringen og filmene, der kører nu */}
      {children}

      {/* 3. Sektionen folder sig ud her, under filmene, der kører nu */}
      {open && (
        <section id="kommende-film-sektion" className={styles.section} aria-labelledby="kommende-film">
          {/* Figma "Kommende film – header" */}
          <div className={styles.header}>
            {/* tabIndex={-1} gør, at overskriften kan få fokus fra koden (se useEffect ovenfor),
                uden at den bliver et ekstra stop, når man tabber gennem siden */}
            <h2 id="kommende-film" ref={headingRef} tabIndex={-1} className={styles.title}>
              Kommende film
            </h2>
            <p className={styles.intro}>Få besked, når billetsalget åbner – eller køb i forsalg allerede nu</p>

            {/* Figma "Filtre": en streg før og efter knapperne.
                role="group" samler knapperne, så skærmlæsere læser dem op som én gruppe.
                Stregerne er kun pynt, så de skjules for skærmlæsere med aria-hidden. */}
            <div className={styles.filters} role="group" aria-label="Vis kommende film">
              <span className={styles.divider} aria-hidden="true" />
              {filters.map((item) => (
                // Chip er Figmas "Option button". selected giver den blå kant på det valgte filter.
                <Chip key={item.key} selected={filter === item.key} onClick={() => setFilter(item.key)}>
                  {item.label}
                </Chip>
              ))}
              <span className={styles.divider} aria-hidden="true" />
            </div>
          </div>

          {/* Figma "Filmgitter": en plakat pr. film. Er der ingen film i filteret, vises en kort tekst i stedet. */}
          {shown.length > 0 ? (
            <ul className={styles.grid}>
              {shown.map((movie) => (
                <li key={movie.id}>
                  {/* variant="coming-soon" er Figmas "Kommer snart"-plakat (se MovieCard.js) */}
                  <MovieCard movie={movie} variant="coming-soon" />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Der er ingen kommende film her lige nu.</p>
          )}

          {/* Folder sektionen sammen igen og ruller op til knappen */}
          <Button variant="secondary" className={styles.toggle} onClick={hideSection}>
            Skjul kommende film
          </Button>
        </section>
      )}
    </>
  );
}
