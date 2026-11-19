import { Fragment } from "react";
import FollowButton from "@/components/features/FollowButton";
import TrailerButton from "@/components/features/TrailerButton";
import Button from "@/components/ui/Button";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import { formatCountdown, formatDayKey, formatPremiere, formatPremiereShort } from "@/lib/format";
import styles from "./ComingSoonCard.module.css";

/**
 * Det store kort med en kommende film øverst på forsiden.
 * Figma: "Kommende film – kort" (node 1758:9775). Bruges i FeaturedMovies og som kopi i hero'en (HeroScroll).
 *
 * Billedet er en vindues-parallax (ParallaxFrame). Titlen er delt op i bogstaver (data-char), og det, der
 * tones ind og ud omkring den, er markeret med data-reveal – FeaturedMovies animerer dem, mens man scroller.
 * Tallet i nedtællingen ("Om 31 dage") står i data-days, så det kan tælle op.
 *
 * @param {object} props
 * @param {{ title: string, slug: string, series?: string, director?: string, genres?: string[],
 *   premiere_date?: string, poster_url?: string, hero_url?: string, trailer_url?: string,
 *   ticket_sale_opens?: string | null }} props.movie Uden ticket_sale_opens er billetsalget åbent
 * @param {boolean} [props.copy] Kopien inde i hero'ens sidste plakat: uden billede og toning (dem har plakaten selv),
 *   og man kan ikke klikke eller tabbe ind i den
 * @param {boolean} [props.preload] Hent billedet med det samme (det første kort på siden)
 * @param {"eager" | "lazy"} [props.loading] "eager" henter billedet, før kortet er på skærmen
 * @param {boolean | number} [props.scrub] Parallaxens udjævning (se ParallaxFrame)
 * @param {number} [props.lift] Vis mere af billedets bund (se ParallaxFrame)
 */
export default function ComingSoonCard({ movie, copy = false, preload, loading, scrub, lift }) {
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
    // Billedet er pynt – titlen står som tekst lige nedenfor
    <ParallaxFrame
      as="article"
      src={copy ? undefined : image}
      preload={preload}
      loading={loading}
      scrub={scrub}
      lift={lift}
      className={[styles.card, copy && styles.copy, image && !copy && styles.withImage].filter(Boolean).join(" ")}
      inert={copy || undefined}
      aria-hidden={copy || undefined}
    >
      {/* Figma: "Følg film" til venstre, nøgletal til højre */}
      <div className={styles.top}>
        <div data-reveal>
          <FollowButton title={movie.title} />
        </div>

        {stats.length > 0 && (
          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat} data-reveal>
                <dt>{stat.label}</dt>
                <dd>{withCountingNumber(stat.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className={styles.bottom}>
        <div className={styles.titleBlock}>
          {/* Fx "The Hunger Games" – kun når filmen er en del af en serie */}
          {movie.series && (
            <p className={styles.eyebrow} data-reveal>
              {movie.series}
            </p>
          )}
          {/* Skærmlæsere får hele titlen fra aria-label i stedet for bogstav for bogstav */}
          <h2 className={styles.title} aria-label={movie.title}>
            {movie.title.split(" ").map((word, index) => (
              <Fragment key={index}>
                {index > 0 && " "}
                <span className={styles.word} aria-hidden="true">
                  {[...word].map((char, charIndex) => (
                    <span key={charIndex} className={styles.char} data-char>
                      {char}
                    </span>
                  ))}
                </span>
              </Fragment>
            ))}
          </h2>

          {/* <dl> er en liste med par: "Instruktør" → "Francis Lawrence" */}
          {credits.length > 0 && (
            <dl className={styles.credits} data-reveal>
              {credits.map((credit) => (
                <div key={credit.label} className={styles.credit}>
                  <dt>{credit.label}</dt>
                  <dd>{credit.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className={styles.actions} data-reveal>
          {/* Altid med, så alle kort har de samme knapper. Uden trailer viser vinduet en besked i stedet. */}
          <TrailerButton trailerUrl={movie.trailer_url} title={movie.title} />
          <Button href={`/film/${movie.slug}`}>Køb billet</Button>
        </div>
      </div>
    </ParallaxFrame>
  );
}

// "Om 31 dage" → the number in its own span (data-days), so FeaturedMovies can count it up
function withCountingNumber(text) {
  const match = typeof text === "string" && text.match(/^(\D*)(\d+)(\D*)$/);
  if (!match) {
    return text;
  }
  const [, before, days, after] = match;
  return (
    <>
      {before}
      <span data-days={days}>{days}</span>
      {after}
    </>
  );
}

// "Åbent", or "Åbner 27.11" while ticket sale has not opened yet
function formatTicketSale(opens) {
  if (opens && opens > formatDayKey(new Date())) {
    return `Åbner ${formatPremiereShort(opens)}`;
  }
  return "Åbent";
}
