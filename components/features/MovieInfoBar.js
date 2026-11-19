import FollowButton from "@/components/features/FollowButton";
import TrailerButton from "@/components/features/TrailerButton";
import Button from "@/components/ui/Button";
import { formatAgeShort, formatDuration, formatPremiere } from "@/lib/format";
import styles from "./MovieInfoBar.module.css";

/**
 * Baren nederst i toppen af filmsiden: fakta og en kort tekst til venstre,
 * "Se trailer", "Følg film" og "Køb billet" til højre. Bruges i MovieHero.
 *
 * @param {object} props
 * @param {{ title: string, tagline?: string, short_description?: string, genres?: string[],
 *   duration_min?: number, age_rating?: string, premiere_date?: string, trailer_url?: string }} props.movie
 * @param {string} props.ticketsHref Hvor "Køb billet" fører hen
 */
export default function MovieInfoBar({ movie, ticketsHref }) {
  // Aldersgrænsen kort til boksen, fx "15 år" → "15+" og "Tilladt for alle" → "Alle" (se formatAgeShort i lib/format.js)
  const age = formatAgeShort(movie.age_rating);
  // Taglinen, hvis filmen har en – ellers den korte beskrivelse
  const text = movie.tagline || movie.short_description;

  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        {/* Figma: "Romance   2 t 12 min   [7]   Premiere 22. oktober".
            Hvert punkt vises kun, hvis filmen har oplysningen (&& = "hvis … så vis"). */}
        <ul className={styles.facts}>
          {/* Kun den første genre */}
          {movie.genres?.[0] && <li>{movie.genres[0]}</li>}
          {movie.duration_min && <li>{formatDuration(movie.duration_min)}</li>}
          {age && (
            <li>
              {/* Boksen viser kun tallet, så skærmlæsere får hele aldersgrænsen læst op i stedet */}
              <span className={styles.age} aria-label={`Aldersgrænse: ${movie.age_rating}`}>
                {age}
              </span>
            </li>
          )}
          {movie.premiere_date && <li>Premiere {formatPremiere(movie.premiere_date)}</li>}
        </ul>
        {text && <p className={styles.text}>{text}</p>}
      </div>

      {/* De eksisterende knapper, genbrugt uden ændringer */}
      <div className={styles.actions}>
        <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} />
        <FollowButton title={movie.title} />
        <Button href={ticketsHref}>Køb billet</Button>
      </div>
    </div>
  );
}
