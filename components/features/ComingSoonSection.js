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

// Antal plakater, før man skal trykke "Se alle kommende film": 2 rækker á 5 som i Figma
const VISIBLE_COUNT = 10;

/**
 * "Kommende film" på forsiden – under filmene, der kører nu.
 * Figma: "Kommende film – udfold" (node 2521:34621) i "Forside – samlet" (node 1856:79051).
 *
 * Overskrift, filtre og de første 10 plakater står altid fremme. "Se alle kommende film" nederst viser resten,
 * og "Skjul kommende film" viser kun de første 10 igen og ruller op til overskriften.
 *
 * Filmene hentes på siden med getComingSoon() og kommer ind som props –
 * komponenten taler aldrig selv med databasen. Se docs/kommende-film.md.
 *
 * @param {object} props
 * @param {Array<{ id: number, slug: string, title: string, poster_url?: string, premiere_date?: string,
 *   ticket_sale_opens?: string | null, ticket_sale_open: boolean }>} props.movies Fra getComingSoon()
 */
export default function ComingSoonSection({ movies }) {
  // Vises alle plakater, eller kun de første 10?
  const [showAll, setShowAll] = useState(false);

  // Det valgte filter: "all" (Alle), en måned som "2026-11" eller "presale" (Forsalg åben)
  const [filter, setFilter] = useState("all");

  // Overskriften, så vi kan rulle og flytte fokus hen til den, når plakaterne skjules igen
  const headingRef = useRef(null);

  // Er plakaterne lige blevet skjult? Vi kan først rulle, når React har vist den kortere liste – derfor useEffect.
  const scrollToHeading = useRef(false);

  useEffect(() => {
    if (!scrollToHeading.current) {
      return;
    }
    scrollToAndFocus(headingRef.current);
    scrollToHeading.current = false;
  }, [showAll]);

  function toggleShowAll() {
    if (showAll) {
      scrollToHeading.current = true;
    }
    setShowAll(!showAll);
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

  // De første 10, indtil man trykker "Se alle kommende film"
  const visible = showAll ? shown : shown.slice(0, VISIBLE_COUNT);

  return (
    <section className={styles.section} aria-labelledby="kommende-film">
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
      {visible.length > 0 ? (
        <ul id="kommende-film-liste" className={styles.grid}>
          {visible.map((movie) => (
            <li key={movie.id}>
              {/* variant="coming-soon" er Figmas "Kommer snart"-plakat (se MovieCard.js) */}
              <MovieCard movie={movie} variant="coming-soon" />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>Der er ingen kommende film her lige nu.</p>
      )}

      {/* Figma "Se mere": kun når der er flere end 10 film i filteret.
          aria-expanded fortæller skærmlæsere, om alle plakater vises, og aria-controls peger på listen. */}
      {shown.length > VISIBLE_COUNT && (
        <Button
          variant="secondary"
          className={styles.toggle}
          aria-expanded={showAll}
          aria-controls="kommende-film-liste"
          onClick={toggleShowAll}
        >
          {showAll ? "Skjul kommende film" : "Se alle kommende film"}
        </Button>
      )}
    </section>
  );
}
