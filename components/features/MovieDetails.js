import BearRating from "@/components/features/BearRating";
import PosterPlaceholder from "@/components/features/PosterPlaceholder";
import ShareButton from "@/components/features/ShareButton";
import TrailerButton from "@/components/features/TrailerButton";
import { formatAgeRating, formatDuration, formatPremiere } from "@/lib/format";
import styles from "./MovieDetails.module.css";

/**
 * Plakat, handling og fakta under heroen. Figma "Filmdetaljer/Default"
 *
 * @param {object} props
 * @param {object} props.movie filmen fra getMovieBySlug (lib/data/movies.js)
 */
export default function MovieDetails({ movie }) {
  const plot = movie.description || movie.short_description;

  return (
    <section className={styles.details} aria-label={`Om ${movie.title}`}>
      <div className={styles.posterColumn}>
        <div className={styles.poster}>
          {movie.poster_url ? <img src={movie.poster_url} alt="" /> : <PosterPlaceholder title={movie.title} />}
        </div>

        <div className={styles.actions}>
          <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} className={styles.trailer} />
          <ShareButton title={movie.title} />
        </div>
      </div>

      <div className={styles.text}>
        {plot && (
          <div className={styles.plot}>
            <p className={styles.plotText}>{plot}</p>
          </div>
        )}

        <hr className={styles.divider} />

        <div className={styles.facts}>
          <dl className={styles.factColumn}>
            <Fact label="Premiere" value={movie.premiere_date && formatPremiere(movie.premiere_date)} />
            <Fact label="Spilletid" value={formatDuration(movie.duration_min)} />
            <Fact label="Censur" value={formatAgeRating(movie.age_rating)} />
          </dl>

          <dl className={styles.factColumn}>
            <Fact label="Instruktør" value={movie.director} />
            <Fact label="Distributør" value={movie.distributor} />
            <Fact label="Genre" list={movie.genres} />
          </dl>

          <dl className={styles.factColumn}>
            <Fact label="Medvirkende" list={movie.cast_members} />
            {movie.rating !== null && <Fact label="Anmeldelser" value={<BearRating rating={movie.rating} />} />}
          </dl>
        </div>
      </div>
    </section>
  );
}

// Ét faktum med overskrift. "list" vises med ét punkt pr. linje. Ingen værdi → vises ikke
function Fact({ label, value, list }) {
  const hasList = list && list.length > 0;

  if (!value && !hasList) {
    return null;
  }

  return (
    <div className={styles.fact}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>
        {hasList ? (
          <ul className={styles.lines}>
            {list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
