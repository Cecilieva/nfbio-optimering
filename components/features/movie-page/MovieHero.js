import BouncingBall from "./BouncingBall";
import CaseLabel from "./CaseLabel";
import Countdown from "@/components/features/checkout/Countdown";
import Flashlight from "./Flashlight";
import MovieInfoBar from "./MovieInfoBar";
import MovieTitle from "./MovieTitle";
import BackLink from "@/components/ui/BackLink";
import styles from "./MovieHero.module.css";

/**
 * Toppen af filmsiden: billede, "Tilbage", titel + MovieInfoBar
 * Clayface får lommelygte og REC-linje i stedet for projektoren.
 * Katten med Hatten får en rød bold, man kan skubbe rundt med musen (BouncingBall)
 *
 * @param {object} props
 * @param {object} props.movie fra getMovieBySlug (+ hero_url, poster_url, before_premiere, case_genre)
 * @param {string} [props.ticketsHref="#spilletider"] hvor "Køb billet" fører hen
 * @param {boolean} [props.loggedIn] Er man logget ind? ("Følg film" viser ellers en besked om at logge ind)
 */
export default function MovieHero({ movie, ticketsHref = "#spilletider", loggedIn }) {
  const image = movie.hero_url || movie.poster_url;
  const caseGenre = movie.case_genre;
  const flashlight = Boolean(caseGenre && image);
  // Standard = ikke thriller, familie eller lommelygte
  const standard = !movie.theme && !flashlight;

  return (
    <section
      className={styles.hero}
      data-standard={standard || undefined}
      data-flashlight={flashlight || undefined}
      aria-labelledby="movie-title"
    >
      {/* Billedet ligger i sit eget lag, så beskeden fra "Følg film" ikke bliver skåret væk */}
      <div className={styles.backdrop}>
        {flashlight ? (
          <Flashlight image={image} />
        ) : (
          <>
            {image && <img src={image} alt="" className={styles.image} />}
            <div className={styles.toning} aria-hidden="true" />
            <div className={styles.beam} aria-hidden="true" />
            <div className={styles.fadeTop} aria-hidden="true" />
            {/* Figma "Lup Katten": den røde bold – kun på Katten med Hatten */}
            {movie.title_variant === "katten" && <BouncingBall />}
          </>
        )}
      </div>

      <div className={styles.top}>
        <div className={styles.topLeft}>
          {/* Figma "Knap", Type=Tilbage */}
          <BackLink href="/film" />
          {/* fx 1 → "0001" */}
          {caseGenre && <CaseLabel text={`Sag nr. ${String(movie.id).padStart(4, "0")} · ${caseGenre}`} />}
        </div>
        {movie.before_premiere && <Countdown variant="premiere" until={movie.premiere_date} />}
      </div>

      <div className={styles.bottom}>
        <div className={styles.title}>
          <MovieTitle title={movie.title} id="movie-title" variant={movie.title_variant} />
        </div>

        <div className={styles.details}>
          <MovieInfoBar movie={movie} ticketsHref={ticketsHref} loggedIn={loggedIn} />
        </div>
      </div>
    </section>
  );
}
