import BearRating from "@/components/features/BearRating";
import Poster from "@/components/features/Poster";
import ShareButton from "@/components/features/ShareButton";
import TrailerButton from "@/components/features/TrailerButton";
import { formatAgeRating, formatDuration, formatPremiere } from "@/lib/format";
import styles from "./MovieDetails.module.css";

// Plakat, handling og fakta under toppen af filmsiden
//
//   movie - filmen fra getMovieBySlug
export default function MovieDetails({ movie }) {
  const plot = movie.description || movie.short_description;

  return (
    <section className={styles.details} aria-label={`Om ${movie.title}`}>
      <div className={styles.posterColumn}>
        <div className={styles.poster}>
          <Poster src={movie.poster_url} title={movie.title} />
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

// Ét faktum med overskrift. "list" giver ét punkt pr. linje. Uden værdi vises det ikke
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
