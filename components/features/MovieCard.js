import Link from "next/link";
import PosterPlaceholder from "@/components/features/PosterPlaceholder";
import buttonStyles from "@/components/ui/Button.module.css";
import { formatAgeShort, formatDayMonthShort, formatDuration } from "@/lib/format";
import styles from "./MovieCard.module.css";

/**
 * A film in a list. Links to the film page.
 *
 * Variants:
 *   default     – poster, title, age rating and length (not styled yet)
 *   coming-soon – Figma "Kommer snart" (node 927:6300): the poster with premiere and ticket sale on top.
 *                 Used in ComingSoonSection.
 *   feed        – Figma "card i feed" (node 214:3673): the poster with format, title, genre and age.
 *                 Used in the list under the filter on /film (MovieFilter).
 *
 * @param {object} props
 * @param {{ slug: string, title: string, poster_url?: string, age_rating?: string, duration_min?: number,
 *   premiere_date?: string, ticket_sale_opens?: string | null, ticket_sale_open?: boolean }} props.movie
 * @param {"default" | "coming-soon" | "feed"} [props.variant="default"]
 * @param {string} [props.format] Variant "feed": the format in the corner, e.g. "2D"
 */
export default function MovieCard({ movie, variant = "default", format }) {
  // Plakaten til "Kommende film" har sit eget udseende, så den bygges i en funktion for sig (nederst)
  if (variant === "coming-soon") {
    return <ComingSoonPoster movie={movie} />;
  }

  // Kortet i listen under filtreringen har også sit eget udseende (se FeedPoster nederst)
  if (variant === "feed") {
    return <FeedPoster movie={movie} format={format} />;
  }

  const details = [movie.age_rating, formatDuration(movie.duration_min)].filter(Boolean);

  return (
    <Link href={`/film/${movie.slug}`}>
      {movie.poster_url ? (
        <img src={movie.poster_url} alt="" />
      ) : (
        <PosterPlaceholder title={movie.title} />
      )}
      <h3>{movie.title}</h3>
      {details.length > 0 && <p>{details.join(" · ")}</p>}
    </Link>
  );
}

/**
 * Figma "Kommer snart" (node 927:6300): plakaten under "Kommende film".
 * Billede med mørk toning, premieren i midten og titlen nederst. Hele plakaten er et link til toppen af filmsiden,
 * så man ser billede, trailer og handling først.
 * Holder man musen over (eller står på den med tastaturet), skjules teksten, og en knap vises i midten –
 * Figma "Filmplakat", Property 1=få notifikationer (node 913:14280): "Se spilletider", når billetsalget er åbent,
 * ellers "Læs mere".
 */
function ComingSoonPoster({ movie }) {
  // ticket_sale_open regnes ud i getComingSoon() (7 dage før premieren, lib/data/ticket-sale.js)
  const canBuy = movie.ticket_sale_open;

  // Teksten under datoen: "Billetsalget er åbent", ellers hvornår det åbner, fx "Billetsalg fra 24. nov"
  const ticketSale =
    canBuy || !movie.ticket_sale_opens
      ? "Billetsalget er åbent"
      : `Billetsalg fra ${formatDayMonthShort(movie.ticket_sale_opens)}`;

  return (
    <Link href={`/film/${movie.slug}`} className={`${styles.poster} ${styles.comingSoon}`}>
      {/* Billedet er pynt – titlen står som tekst nedenfor, så alt="" er nok.
          Har filmen intet billede, ses den blå gradient fra CSS'en i stedet. */}
      {movie.poster_url && <img src={movie.poster_url} alt="" className={styles.image} />}

      {/* Figma "Midte": kalender, premiere og billetsalg står i midten af plakaten */}
      <div className={styles.middle}>
        {movie.premiere_date && (
          <p className={styles.premiere}>
            <img src="/icons/calendar.svg" alt="" width={24} height={24} className={styles.icon} />
            <span className={styles.date}>
              {/* Kun til skærmlæsere, så datoen læses op som "Premiere 19. nov" */}
              <span className={styles.visuallyHidden}>Premiere </span>
              {formatDayMonthShort(movie.premiere_date)}
            </span>
            <span className={styles.ticketSale}>{ticketSale}</span>
          </p>
        )}
      </div>

      {/* Figma "Bund": titlen. Lange titler slutter med "…" (se MovieCard.module.css). */}
      <h3 className={styles.title}>{movie.title}</h3>

      {/* Figma "få notifikationer": knappen ved hover. En span, fordi hele plakaten allerede er linket
          (se FeedPoster). aria-hidden: skærmlæsere hører titlen fra linket. */}
      <span className={`${buttonStyles.button} ${styles.action}`} data-variant="primary" aria-hidden="true">
        {canBuy ? "Se spilletider" : "Læs mere"}
      </span>
    </Link>
  );
}

/**
 * Figma "card i feed" (node 214:3673): plakaten i listen med de film, der kører nu.
 * Billede med mørk toning, formatet øverst til højre og titel, genre og alder nederst.
 * Hele kortet er et link til filmsiden. Holder man musen over (eller står på det med tastaturet),
 * bliver kortet mørkere, teksten skjules, og "Se spilletider" vises i midten –
 * Figma "Filmplakat", Property 1=se spilletider (node 455:11441).
 */
function FeedPoster({ movie, format }) {
  // Figma viser kun én genre og alderen som "15+", fx "Thriller · 15+"
  const details = [movie.genres?.[0], formatAgeShort(movie.age_rating)].filter(Boolean);

  return (
    <Link href={`/film/${movie.slug}`} className={`${styles.poster} ${styles.feed}`}>
      {/* Billedet er pynt – titlen står som tekst nedenfor, så alt="" er nok.
          Har filmen intet billede, ses den blå gradient fra CSS'en i stedet. */}
      {movie.poster_url && <img src={movie.poster_url} alt="" className={styles.image} />}

      {/* Figma "Genre-chip": formatet øverst til højre, fx "2D" */}
      <div className={styles.feedTop}>
        {format && (
          <span className={styles.formatChip}>
            <span className={styles.visuallyHidden}>Format </span>
            {format}
          </span>
        )}
      </div>

      {/* Figma "se spilletider": ligner en blå knap (samme styles som Button "primary").
          Det er en span og ikke en knap, fordi hele kortet allerede er et link til filmsiden med spilletiderne.
          aria-hidden: skærmlæsere hører titlen fra linket, så teksten ville bare blive læst op to gange. */}
      <span className={`${buttonStyles.button} ${styles.action}`} data-variant="primary" aria-hidden="true">
        Se spilletider
      </span>

      {/* Titlen og "Thriller · 15+" nederst */}
      <div className={styles.feedBottom}>
        <h3 className={styles.title}>{movie.title}</h3>
        {details.length > 0 && (
          <p className={styles.details}>
            {details.map((detail, index) => (
              // Prikken mellem genre og alder er pynt, så skærmlæsere springer den over
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
    </Link>
  );
}
