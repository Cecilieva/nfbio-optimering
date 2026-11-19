import Image from "next/image";
import Link from "next/link";
import CaseLabel from "@/components/features/CaseLabel";
import Countdown from "@/components/features/Countdown";
import Flashlight from "@/components/features/Flashlight";
import MovieInfoBar from "@/components/features/MovieInfoBar";
import MovieTitle from "@/components/features/MovieTitle";
import styles from "./MovieHero.module.css";

/**
 * Toppen af filmsiden: "Tilbage", billede, titel + MovieInfoBar
 * før premieren → nedtælling øverst til højre
 * kommende thriller/gyser → REC-linje, lommelygte i stedet for projektor og smeltende titel
 * ellers Figma "Projektor – standard" (3063:14519): lyset fejer hen, så langsom zoom. kun css-animationer
 *
 * @param {object} props
 * @param {object} props.movie fra getMovieBySlug (+ hero_url, poster_url, before_premiere, case_genre)
 * @param {string} [props.ticketsHref="#spilletider"] hvor "Køb billet" fører hen
 */
export default function MovieHero({ movie, ticketsHref = "#spilletider" }) {
  // brede billede, ellers plakaten
  const image = movie.hero_url || movie.poster_url;
  const caseGenre = movie.case_genre;
  // thriller/gyser med billede → lommelygte
  const flashlight = Boolean(caseGenre && image);

  return (
    <section className={styles.hero} aria-labelledby="movie-title">
      {flashlight ? (
        // billedet i mørke + lyskegle
        <Flashlight image={image} />
      ) : (
        <>
          {/* pynt – titlen står som tekst */}
          {image && <img src={image} alt="" className={styles.image} />}
          {/* toning, lysstribe og fade – pynt */}
          <div className={styles.toning} aria-hidden="true" />
          <div className={styles.beam} aria-hidden="true" />
          <div className={styles.fadeTop} aria-hidden="true" />
        </>
      )}

      {/* "Tilbage" venstre, nedtælling højre */}
      <div className={styles.top}>
        {/* "Tilbage" + sagsmappe-linjen 32px under */}
        <div className={styles.topLeft}>
          <Link href="/film" className={styles.back}>
            <Image src="/icons/chevron-down.svg" alt="" width={12} height={9} className={styles.backIcon} />
            Tilbage
          </Link>
          {/* id 1 → "0001" */}
          {caseGenre && <CaseLabel text={`Sag nr. ${String(movie.id).padStart(4, "0")} · ${caseGenre}`} />}
        </div>
        {/* kun før premieren */}
        {movie.before_premiere && <Countdown variant="premiere" until={movie.premiere_date} />}
      </div>

      <div className={styles.bottom}>
        <div className={styles.title}>
          {/* thriller/gyser → melt, ellers standard */}
          <MovieTitle title={movie.title} id="movie-title" variant={caseGenre ? "melt" : "standard"} />
        </div>

        <div className={styles.details}>
          <MovieInfoBar movie={movie} ticketsHref={ticketsHref} />
        </div>
      </div>
    </section>
  );
}
