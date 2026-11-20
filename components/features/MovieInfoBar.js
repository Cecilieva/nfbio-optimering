import FollowButton from "@/components/features/FollowButton";
import TrailerButton from "@/components/features/TrailerButton";
import Button from "@/components/ui/Button";
import { formatAgeShort, formatDuration, formatPremiere } from "@/lib/format";
import styles from "./MovieInfoBar.module.css";

/**
 * Baren nederst i heroen: fakta + tekst til venstre, knapperne til højre
 *
 * @param {object} props
 * @param {{ title: string, tagline?: string, short_description?: string, genres?: string[],
 *   duration_min?: number, age_rating?: string, premiere_date?: string, trailer_url?: string,
 *   ticket_sale_open?: boolean }} props.movie "Følg film" vises kun, når billetsalget ikke er åbent endnu
 * @param {string} props.ticketsHref hvor "Køb billet" fører hen
 */
export default function MovieInfoBar({ movie, ticketsHref }) {
  // "15 år" → "15+", "Tilladt for alle" → "Alle" (formatAgeShort)
  const age = formatAgeShort(movie.age_rating);
  // tagline, ellers kort beskrivelse
  const text = movie.tagline || movie.short_description;

  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        {/* "Romance   2 t 12 min   [7]   Premiere 22. oktober" – kun det filmen har */}
        <ul className={styles.facts}>
          {/* kun 1. genre */}
          {movie.genres?.[0] && <li>{movie.genres[0]}</li>}
          {movie.duration_min && <li>{formatDuration(movie.duration_min)}</li>}
          {age && (
            <li>
              {/* boksen viser kun tallet → skærmlæsere får det hele */}
              <span className={styles.age} aria-label={`Aldersgrænse: ${movie.age_rating}`}>
                {age}
              </span>
            </li>
          )}
          {movie.premiere_date && <li>Premiere {formatPremiere(movie.premiere_date)}</li>}
        </ul>
        {text && <p className={styles.text}>{text}</p>}
      </div>

      {/* de knapper vi allerede har */}
      <div className={styles.actions}>
        <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} />
        {/* "Følg film" giver besked, når billetsalget åbner – ikke relevant, når salget allerede er åbent */}
        {!movie.ticket_sale_open && <FollowButton title={movie.title} />}
        <Button href={ticketsHref}>Køb billet</Button>
      </div>
    </div>
  );
}
