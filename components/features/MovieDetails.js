import BearRating from "@/components/features/BearRating";
import PosterPlaceholder from "@/components/features/PosterPlaceholder";
import ShareButton from "@/components/features/ShareButton";
import TrailerButton from "@/components/features/TrailerButton";
import { formatAgeRating, formatDuration, formatPremiere } from "@/lib/format";
import styles from "./MovieDetails.module.css";

/**
 * Sektionen under det store billede på filmsiden.
 * Figma: "Filmdetaljer/Default" (node 2250:15224)
 *
 * Venstre side: plakaten + knapperne "Se trailer" og "Del"
 * Højre side: handlingen (stor tekst), en streg og fakta om filmen
 *
 * Farverne skifter selv mellem standard, thriller og familie.
 * Det sker i tokens.css ud fra data-theme på <main> – derfor står der intet om modes her.
 *
 * @param {object} props
 * @param {object} props.movie filmen fra getMovieBySlug (lib/data/movies.js)
 */
export default function MovieDetails({ movie }) {
  // Den store tekst er handlingen.
  // Har filmen ingen handling, bruger vi den korte beskrivelse i stedet.
  const plot = movie.description || movie.short_description;

  // Den lille grå tekst under handlingen er den korte beskrivelse.
  // Men toppen af siden viser allerede den korte beskrivelse, hvis filmen ikke har en tagline.
  // Så vi viser den kun her, når filmen HAR en tagline – ellers ville samme tekst stå to gange.
  let more = null;
  if (movie.description && movie.tagline) {
    more = movie.short_description;
  }

  return (
    <section className={styles.details} aria-label={`Om ${movie.title}`}>
      {/* ---------- Venstre side: plakat + knapper ---------- */}
      <div className={styles.posterColumn}>
        <div className={styles.poster}>
          {/* Har filmen ingen plakat, viser vi en boks med titlen i stedet */}
          {movie.poster_url ? <img src={movie.poster_url} alt="" /> : <PosterPlaceholder title={movie.title} />}
        </div>

        <div className={styles.actions}>
          {/* className gør "Se trailer" bred */}
          <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} className={styles.trailer} />
          <ShareButton title={movie.title} />
        </div>
      </div>

      {/* ---------- Højre side: tekst + fakta ---------- */}
      <div className={styles.text}>
        {/* Figma "Handling" – kun hvis filmen har en tekst */}
        {plot && (
          <div className={styles.plot}>
            <p className={styles.plotText}>{plot}</p>
            {more && <p className={styles.more}>{more}</p>}
          </div>
        )}

        {/* Figma "Skillelinje" – den tynde streg */}
        <hr className={styles.divider} />

        {/* Figma "Om filmen" – 3 kolonner med fakta.
            Fact viser ingenting, hvis filmen ikke har en værdi (se nederst i filen).
            list = en liste, der vises med ét punkt pr. linje (genrer og medvirkende) */}
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
            {/* Kun bjørne, hvis filmen har fået en bedømmelse */}
            {movie.rating !== null && <Fact label="Anmeldelser" value={<BearRating rating={movie.rating} />} />}
          </dl>
        </div>
      </div>
    </section>
  );
}

// Ét faktum: en lille overskrift (fx "Premiere") og værdien under (fx "22. december").
// Giv den enten en "value" (én tekst) eller en "list" (flere tekster, fx genrer).
// Har filmen ingen værdi, vises ingenting – så står der ikke en tom overskrift.
function Fact({ label, value, list }) {
  const hasList = list && list.length > 0;

  if (!value && !hasList) {
    return null;
  }

  return (
    <div className={styles.fact}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>
        {/* En liste vises med ét punkt pr. linje – ellers bare teksten */}
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
