// "use client": komponenten kører i browseren, fordi den skal huske, hvad brugeren klikker på (useState)
"use client";

import { useEffect, useRef, useState } from "react";
import MovieCard from "@/components/features/MovieCard";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { formatMonth } from "@/lib/format";
import styles from "./ComingSoonSection.module.css";

/**
 * "Kommende film" på forsiden, under de fremhævede film.
 * Figma: "Kommende film – udfold" (node 2221:15159).
 *   Lukket (2848:14500): kun knappen "Se alle kommende film".
 *   Åben (2849:14585): overskrift, filtre og plakater. "Skjul kommende film" folder den sammen igen.
 *
 * Filmene hentes på siden med getComingSoon() og kommer ind som props –
 * komponenten taler aldrig selv med databasen. Se docs/kommende-film.md.
 *
 * @param {object} props
 * @param {Array<{ id: number, slug: string, title: string, poster_url?: string, premiere_date?: string,
 *   ticket_sale_opens?: string | null, ticket_sale_open: boolean }>} props.movies Fra getComingSoon()
 */
export default function ComingSoonSection({ movies }) {
  // Er sektionen foldet ud? Den starter lukket, så man kun ser knappen.
  const [open, setOpen] = useState(false);

  // Det valgte filter: "all" (Alle), en måned som "2026-11" eller "presale" (Forsalg åben)
  const [filter, setFilter] = useState("all");

  // Referencer til overskriften og knappen, så vi kan flytte fokus hen til dem
  const headingRef = useRef(null);
  const openButtonRef = useRef(null);

  // Husker, om brugeren har klikket. Fokus må kun flytte efter et klik – ikke når siden indlæses,
  // for så ville siden hoppe ned til knappen.
  const hasToggled = useRef(false);

  // Når sektionen foldes ud, lander fokus på overskriften, og når den foldes sammen, på knappen igen.
  // Så mister man ikke sin plads, hvis man bruger tastatur eller skærmlæser.
  useEffect(() => {
    if (!hasToggled.current) {
      return;
    }
    if (open) {
      headingRef.current?.focus();
    } else {
      openButtonRef.current?.focus();
    }
  }, [open]);

  // Bruges af begge knapper: true folder ud, false folder sammen
  function toggle(next) {
    hasToggled.current = true;
    setOpen(next);
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

  // Lukket tilstand: kun knappen.
  // aria-expanded fortæller skærmlæsere, at knappen folder noget ud, og at det er lukket nu.
  if (!open) {
    return (
      <div className={styles.closed}>
        <Button
          ref={openButtonRef}
          variant="secondary"
          className={styles.toggle}
          aria-expanded={false}
          onClick={() => toggle(true)}
        >
          Se alle kommende film
        </Button>
      </div>
    );
  }

  // Åben tilstand: overskrift, filtre, plakater og knappen, der folder sammen igen
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

      {/* Folder sektionen sammen igen. aria-expanded={true}: det, knappen styrer, er åbent nu. */}
      <Button variant="secondary" className={styles.toggle} aria-expanded={true} onClick={() => toggle(false)}>
        Skjul kommende film
      </Button>
    </section>
  );
}
