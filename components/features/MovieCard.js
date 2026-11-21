import Link from "next/link";
import LinkLoader from "@/components/features/loading/LinkLoader";
import Poster from "@/components/features/Poster";
import buttonStyles from "@/components/ui/Button.module.css";
import { formatAgeShort, formatDayMonthShort, formatDuration } from "@/lib/format";
import styles from "./MovieCard.module.css";

// En film i en liste. Linker til filmsiden.
//
//   movie   - filmen (titel, plakat, alder, længde, premiere og billetsalg)
//   variant - "default": plakat, titel, alder og længde (ikke stylet endnu)
//             "coming-soon": plakaten under "Kommende film" med premiere og billetsalg
//             "feed": kortet i listen under filtreringen på /film
//   formats - kun "feed": formaterne i hjørnet, fx ["2D", "3D"]
export default function MovieCard({ movie, variant = "default", formats = [] }) {
  // "Kommende film" har sit eget udseende (se nederst)
  if (variant === "coming-soon") {
    return <ComingSoonPoster movie={movie} />;
  }

  // Det samme har kortet under filtreringen
  if (variant === "feed") {
    return <FeedPoster movie={movie} formats={formats} />;
  }

  const details = [movie.age_rating, formatDuration(movie.duration_min)].filter(Boolean);

  return (
    <Link href={`/film/${movie.slug}`}>
      <Poster src={movie.poster_url} title={movie.title} />
      <h3>{movie.title}</h3>
      {details.length > 0 && <p>{details.join(" · ")}</p>}
      {/* Loaderen vises altid på vej ind på filmsiden */}
      <LinkLoader always />
    </Link>
  );
}

// Plakaten under "Kommende film": premieren i midten og titlen nederst. Linker til filmsiden.
// Ved hover eller fokus skjules teksten, og der står "Se spilletider" (billetsalget er åbent) eller "Læs mere"
function ComingSoonPoster({ movie }) {
  // Billetsalget åbner 7 dage før premieren (regnes ud i getComingSoon)
  const canBuy = movie.ticket_sale_open;

  // Under datoen: "Billetsalget er åbent" eller fx "Billetsalg fra 24. nov"
  const ticketSale =
    canBuy || !movie.ticket_sale_opens
      ? "Billetsalget er åbent"
      : `Billetsalg fra ${formatDayMonthShort(movie.ticket_sale_opens)}`;

  return (
    <Link href={`/film/${movie.slug}`} className={`${styles.poster} ${styles.comingSoon}`}>
      {/* Uden billede ses den blå baggrund fra CSS'en */}
      <Poster src={movie.poster_url} title={movie.title} className={styles.image} placeholder={false} />

      {/* Midten: premiere og billetsalg */}
      <div className={styles.middle}>
        {movie.premiere_date && (
          <p className={styles.premiere}>
            <img src="/icons/calendar.svg" alt="" width={24} height={24} className={styles.icon} />
            <span className={styles.date}>
              {/* Skærmlæsere hører fx "Premiere 19. nov" */}
              <span className={styles.visuallyHidden}>Premiere </span>
              {formatDayMonthShort(movie.premiere_date)}
            </span>
            <span className={styles.ticketSale}>{ticketSale}</span>
          </p>
        )}
      </div>

      {/* Titlen. Lange titler slutter med "…" */}
      <h3 className={styles.title}>{movie.title}</h3>

      {/* Knappen ved hover. En span, fordi hele plakaten er et link. Skjult for skærmlæsere */}
      <span className={`${buttonStyles.button} ${styles.action}`} data-variant="primary" aria-hidden="true">
        {canBuy ? "Se spilletider" : "Læs mere"}
      </span>
      {/* Loaderen vises altid på vej ind på filmsiden */}
      <LinkLoader always />
    </Link>
  );
}

// Kortet i listen med de film, der kører nu: formatet øverst og titel, genre og alder nederst.
// Ved hover eller fokus bliver det mørkere, og der står "Se spilletider"
function FeedPoster({ movie, formats }) {
  // Kun én genre og alderen som "15+", fx "Thriller · 15+"
  const details = [movie.genres?.[0], formatAgeShort(movie.age_rating)].filter(Boolean);

  return (
    <Link href={`/film/${movie.slug}`} className={`${styles.poster} ${styles.feed}`}>
      {/* Uden billede ses den blå baggrund fra CSS'en */}
      <Poster src={movie.poster_url} title={movie.title} className={styles.image} placeholder={false} />

      {/* Formaterne øverst til højre, fx "2D" og "3D" */}
      <div className={styles.feedTop}>
        {formats.map((format) => (
          <span key={format} className={styles.formatChip}>
            <span className={styles.visuallyHidden}>Format </span>
            {format}
          </span>
        ))}
      </div>

      {/* Ligner en blå knap, men er en span, fordi hele kortet er et link. Skjult for skærmlæsere */}
      <span className={`${buttonStyles.button} ${styles.action}`} data-variant="primary" aria-hidden="true">
        Se spilletider
      </span>

      {/* Titlen og "Thriller · 15+" nederst */}
      <div className={styles.feedBottom}>
        <h3 className={styles.title}>{movie.title}</h3>
        {details.length > 0 && (
          <p className={styles.details}>
            {details.map((detail, index) => (
              // Prikken er pynt
              <span key={detail}>
                {index > 0 && (
                  <span className={styles.dot} aria-hidden="true">
                    ·
                  </span>
                )}
                {detail}
              </span>
            ))}
          </p>
        )}
      </div>
      {/* Loaderen vises altid på vej ind på filmsiden */}
      <LinkLoader always />
    </Link>
  );
}
