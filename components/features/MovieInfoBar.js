import FollowButton from "@/components/features/FollowButton";
import TrailerButton from "@/components/features/TrailerButton";
import Button from "@/components/ui/Button";
import { formatDuration, formatPremiere } from "@/lib/format";
import styles from "./MovieInfoBar.module.css";

/**
 * Baren nederst i heroen: fakta + tekst til venstre, knapperne til højre
 *
 * @param {object} props
 * @param {{ title: string, short_description?: string, genres?: string[],
 *   duration_min?: number, age_rating?: string, premiere_date?: string, trailer_url?: string,
 *   ticket_sale_open?: boolean }} props.movie "Følg film" før billetsalget åbner, "Køb billet" når det er åbent
 * @param {string} props.ticketsHref hvor "Køb billet" fører hen
 * @param {string} [props.loginHref] Link til login, hvis man ikke er logget ind
 */
export default function MovieInfoBar({ movie, ticketsHref, loginHref }) {
  const age = movie.age_rating;
  const text = movie.short_description;

  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        <ul className={styles.facts}>
          {movie.genres?.[0] && <li>{movie.genres[0]}</li>}
          {movie.duration_min && <li>{formatDuration(movie.duration_min)}</li>}
          {age && (
            <li>
              <span className={styles.age} aria-label={`Aldersgrænse: ${age}`}>
                {age}
              </span>
            </li>
          )}
          {movie.premiere_date && <li>Premiere {formatPremiere(movie.premiere_date)}</li>}
        </ul>
        {text && <p className={styles.text}>{text}</p>}
      </div>

      <div className={styles.actions}>
        <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} />
        {/* "Følg film" giver besked, når billetsalget åbner – så den vises kun, indtil salget er åbent.
            "Køb billet" kommer først, når billetsalget er åbnet. */}
        {!movie.ticket_sale_open && <FollowButton title={movie.title} loginHref={loginHref} wideToast />}
        {movie.ticket_sale_open && <Button href={ticketsHref}>Køb billet</Button>}
      </div>
    </div>
  );
}
