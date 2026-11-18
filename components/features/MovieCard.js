import Link from "next/link";
import PosterPlaceholder from "@/components/features/PosterPlaceholder";
import { formatDayMonthShort, formatDuration } from "@/lib/format";
import styles from "./MovieCard.module.css";

/**
 * A film in a list. Links to the film page.
 *
 * Variants:
 *   default     – poster, title, age rating and length (not styled yet)
 *   coming-soon – Figma "Kommer snart" (node 927:6300): the poster with premiere and ticket sale on top.
 *                 Used in ComingSoonSection.
 *
 * @param {object} props
 * @param {{ slug: string, title: string, poster_url?: string, age_rating?: string, duration_min?: number,
 *   premiere_date?: string, ticket_sale_opens?: string | null }} props.movie
 * @param {"default" | "coming-soon"} [props.variant="default"]
 */
export default function MovieCard({ movie, variant = "default" }) {
  // Plakaten til "Kommende film" har sit eget udseende, så den bygges i en funktion for sig (nederst)
  if (variant === "coming-soon") {
    return <ComingSoonPoster movie={movie} />;
  }

  const details = [movie.age_rating, formatDuration(movie.duration_min)].filter(Boolean);

  return (
    <Link href={`/film/${movie.slug}`}>
      {movie.poster_url ? (
        <img src={movie.poster_url} alt="" />
      ) : (
        <PosterPlaceholder title={movie.title} />
      )}
      <h3>{movie.title}</h3>
      {details.length > 0 && <p>{details.join(" · ")}</p>}
    </Link>
  );
}

/**
 * Figma "Kommer snart" (node 927:6300): plakaten under "Kommende film".
 * Billede med mørk toning, premieren i midten og titlen nederst. Hele plakaten er et link til filmsiden.
 */
function ComingSoonPoster({ movie }) {
  // Teksten under datoen: "Billetsalg fra 10. nov", hvis vi kender datoen (lib/data/ticket-sale.js),
  // ellers er billetsalget allerede åbent
  const ticketSale = movie.ticket_sale_opens
    ? `Billetsalg fra ${formatDayMonthShort(movie.ticket_sale_opens)}`
    : "Billetsalg åbent";

  return (
    <Link href={`/film/${movie.slug}`} className={styles.poster}>
      {/* Billedet er pynt – titlen står som tekst nedenfor, så alt="" er nok.
          Har filmen intet billede, ses den blå gradient fra CSS'en i stedet. */}
      {movie.poster_url && <img src={movie.poster_url} alt="" className={styles.image} />}

      {/* Figma "Midte": kalender, premiere og billetsalg står i midten af plakaten */}
      <div className={styles.middle}>
        {movie.premiere_date && (
          <p className={styles.premiere}>
            <img src="/icons/calendar.svg" alt="" width={24} height={24} className={styles.icon} />
            <span className={styles.date}>
              {/* Kun til skærmlæsere, så datoen læses op som "Premiere 19. nov" */}
              <span className={styles.visuallyHidden}>Premiere </span>
              {formatDayMonthShort(movie.premiere_date)}
            </span>
            <span className={styles.ticketSale}>{ticketSale}</span>
          </p>
        )}
      </div>

      {/* Figma "Bund": titlen. Lange titler slutter med "…" (se MovieCard.module.css). */}
      <h3 className={styles.title}>{movie.title}</h3>
    </Link>
  );
}
