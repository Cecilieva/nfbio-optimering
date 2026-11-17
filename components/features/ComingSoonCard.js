import FollowButton from "@/components/features/FollowButton";
import TrailerButton from "@/components/features/TrailerButton";
import Button from "@/components/ui/Button";
import { formatCountdown, formatDayKey, formatPremiere, formatPremiereShort } from "@/lib/format";
import styles from "./ComingSoonCard.module.css";

/**
 * Det store kort med en kommende film øverst på forsiden.
 * Figma: "Kommende film – kort" (node 1758:9775). Bruges i FeaturedCarousel og i slutningen af introen.
 *
 * @param {object} props
 * @param {{ title: string, slug: string, series?: string, director?: string, genres?: string[],
 *   premiere_date?: string, poster_url?: string, hero_url?: string, trailer_url?: string,
 *   ticket_sale_opens?: string | null }} props.movie Uden ticket_sale_opens er billetsalget åbent
 */
export default function ComingSoonCard({ movie }) {
  // Det brede billede, hvis filmen har et – ellers plakaten
  const image = movie.hero_url || movie.poster_url;

  // Kun de oplysninger, filmen faktisk har, kommer med i listerne
  const credits = [
    { label: "Instruktør", value: movie.director },
    { label: "Premiere", value: movie.premiere_date && formatPremiere(movie.premiere_date) },
    { label: "Genre", value: movie.genres?.join(", ") },
  ].filter((credit) => credit.value);

  // Figma "Nøgletal" øverst til højre. Har filmen haft premiere, står der "I biografen nu" i nedtællingen,
  // så alle kort har de samme tre tal.
  const stats = [
    { label: "Premiere", value: movie.premiere_date && formatPremiereShort(movie.premiere_date) },
    {
      label: "Nedtælling",
      value: movie.premiere_date && (formatCountdown(movie.premiere_date) ?? "I biografen nu"),
    },
    { label: "Billetsalg", value: formatTicketSale(movie.ticket_sale_opens) },
  ].filter((stat) => stat.value);

  return (
    <article className={styles.card}>
      {/* Billedet er pynt – titlen står som tekst lige nedenfor */}
      {image && <img src={image} alt="" className={styles.image} />}

      {/* Figma: "Følg film" til venstre, nøgletal til højre */}
      <div className={styles.top}>
        <FollowButton title={movie.title} />

        {stats.length > 0 && (
          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className={styles.bottom}>
        <div className={styles.titleBlock}>
          {/* Fx "The Hunger Games" – kun når filmen er en del af en serie */}
          {movie.series && <p className={styles.eyebrow}>{movie.series}</p>}
          <h2 className={styles.title}>{movie.title}</h2>

          {/* <dl> er en liste med par: "Instruktør" → "Francis Lawrence" */}
          {credits.length > 0 && (
            <dl className={styles.credits}>
              {credits.map((credit) => (
                <div key={credit.label} className={styles.credit}>
                  <dt>{credit.label}</dt>
                  <dd>{credit.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className={styles.actions}>
          {/* Altid med, så alle kort har de samme knapper. Uden trailer viser vinduet en besked i stedet. */}
          <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} />
          <Button href={`/film/${movie.slug}`}>Køb billet</Button>
        </div>
      </div>
    </article>
  );
}

// "Åbent", or "Åbner 27.11" while ticket sale has not opened yet
function formatTicketSale(opens) {
  if (opens && opens > formatDayKey(new Date())) {
    return `Åbner ${formatPremiereShort(opens)}`;
  }
  return "Åbent";
}
