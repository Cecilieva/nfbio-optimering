import Image from "next/image";
import Link from "next/link";
import CaseLabel from "@/components/features/CaseLabel";
import Countdown from "@/components/features/Countdown";
import Flashlight from "@/components/features/Flashlight";
import MovieInfoBar from "@/components/features/MovieInfoBar";
import MovieTitle from "@/components/features/MovieTitle";
import styles from "./MovieHero.module.css";

/**
 * Toppen af filmsiden: "Tilbage", det store billede, titlen og MovieInfoBar (fakta og knapper).
 * Har filmen ikke haft premiere endnu, står en nedtælling til premieren øverst til højre (Countdown "premiere").
 * Er det en kommende thriller eller gyser (første genre), står "REC · SAG NR. …" under "Tilbage" (CaseLabel),
 * og billedet vises med lommelygten (Flashlight, Figma "Lommelygte") i stedet for projektoren.
 * Samme film (kommende, første genre Thriller eller Gyser) får den smeltende titel (MovieTitle "melt", Figma "Titel – smelter").
 * Figma: "Filmside" med "Projektor – standard" (node 3063:14519): projektorlyset fejer hen over billedet,
 * derefter langsom zoom i loop. Titlen (MovieTitle) glider op bagefter. Alt er CSS-animationer.
 *
 * @param {object} props
 * @param {object} props.movie Filmen fra getMovieBySlug (se MovieInfoBar for felterne) + hero_url, poster_url,
 *   before_premiere og case_genre
 * @param {string} [props.ticketsHref="#spilletider"] Hvor "Køb billet" fører hen
 */
export default function MovieHero({ movie, ticketsHref = "#spilletider" }) {
  // Det brede billede, hvis filmen har et – ellers plakaten
  const image = movie.hero_url || movie.poster_url;
  const caseGenre = movie.case_genre;
  // Kommende thriller eller gyser med et billede: lommelygten i stedet for projektoren
  const flashlight = Boolean(caseGenre && image);

  return (
    <section className={styles.hero} aria-labelledby="movie-title">
      {flashlight ? (
        // Billedet i mørke med en lyskegle, man kan flytte med musen
        <Flashlight image={image} />
      ) : (
        <>
          {/* Billedet er pynt – titlen står som tekst */}
          {image && <img src={image} alt="" className={styles.image} />}
          {/* Figma "Toning", "Lysstribe" og "Fade" foroven – kun pynt */}
          <div className={styles.toning} aria-hidden="true" />
          <div className={styles.beam} aria-hidden="true" />
          <div className={styles.fadeTop} aria-hidden="true" />
        </>
      )}

      {/* Figma: "Tilbage" til venstre og nedtællingen til højre på samme række */}
      <div className={styles.top}>
        {/* Figma "Filmside – topbar": "Tilbage" med sagsmappe-linjen 32px under */}
        <div className={styles.topLeft}>
          <Link href="/film" className={styles.back}>
            <Image src="/icons/chevron-down.svg" alt="" width={12} height={9} className={styles.backIcon} />
            Tilbage
          </Link>
          {/* Sagsnummeret er filmens id med nuller foran: id 1 → "0001" (padStart fylder op til 4 tegn) */}
          {caseGenre && <CaseLabel text={`Sag nr. ${String(movie.id).padStart(4, "0")} · ${caseGenre}`} />}
        </div>
        {/* Nedtællingen vises kun før premieren (before_premiere regnes ud i lib/data/movies.js) */}
        {movie.before_premiere && <Countdown variant="premiere" until={movie.premiere_date} />}
      </div>

      <div className={styles.bottom}>
        <div className={styles.title}>
          {/* Kommende thriller/gyser → smeltende titel, alle andre film → standardtitlen */}
          <MovieTitle title={movie.title} id="movie-title" variant={caseGenre ? "melt" : "standard"} />
        </div>

        <div className={styles.details}>
          <MovieInfoBar movie={movie} ticketsHref={ticketsHref} />
        </div>
      </div>
    </section>
  );
}
