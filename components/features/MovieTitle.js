import { Fragment } from "react";
import styles from "./MovieTitle.module.css";

/**
 * Filmens titel øverst på filmsiden.
 *
 * Varianter:
 *   standard – Figma "Titel – standard" (node 3063:14531).
 *              Skjult → Ind: titlen glider op og toner frem, når siden indlæses.
 *              Bølge 1–5: ordene løftes ét efter ét i en bølge – af sig selv hvert 4. sekund.
 *   melt     – Figma "Titel – smelter" (Fast → Smelter, node 1797:9068 / 1797:9099). Kun til filmsiden for
 *              kommende thrillere og gysere: store versaler med dråber (Figma "Dråbe"), der løber ned under
 *              bogstaverne og trækker sig tilbage i et loop (MeltDrips).
 *
 * Har titlen et kolon, fx "The Hunger Games: Sunrise on the Reaping", står delen før kolonet
 * som lille overtitel ("Univers titel" i Figma).
 *
 * @param {object} props
 * @param {string} props.title Filmens titel
 * @param {string} [props.id] Id på <h1>, så sektionen kan pege på den med aria-labelledby
 * @param {"standard" | "melt"} [props.variant="standard"]
 */
export default function MovieTitle({ title, id, variant = "standard" }) {
  // Del titlen i overtitel og selve titlen (se splitSeries nederst)
  const [series, name] = splitSeries(title);
  // Hvert ord får sit eget <span>, så det kan animeres for sig (bølgen) og få sine egne dråber
  const words = name.split(" ");

  return (
    <div className={styles.titleBlock}>
      {series && <p className={styles.series}>{series}</p>}
      {/* data-variant="melt" bruges i CSS'en til at give den smeltende titel sit eget udseende */}
      <h1 id={id} className={styles.title} data-variant={variant}>
        {words.map((word, index) => (
          // --index forsinker hvert ord lidt mere, så bølgen går fra venstre mod højre.
          // Mellemrummet mellem ordene står som tekst, så skærmlæsere og kopiering får hele titlen.
          // Det fylder ikke i flex-layoutet – afstanden kommer fra column-gap.
          <Fragment key={index}>
            {index > 0 && " "}
            <span className={styles.word} style={{ "--index": index }}>
              {word}
              {/* Kun den smeltende titel får dråber under hvert ord */}
              {variant === "melt" && <MeltDrips letters={word.length} />}
            </span>
          </Fragment>
        ))}
      </h1>
    </div>
  );
}

// Dråberne i "Titel – smelter" (Figma "Dråber"): [venstre, bredde, højde] i Figma-px – tallene er kopieret
// direkte fra Figma. Figma tegner dem under CLAYFACE (8 bogstaver, 1380px bred) med skriftstørrelsen 245.697px.
// Hvor dråben starter (lodret), hvor meget den sløres osv. er ens for alle og står som tokens i app/tokens.css.
const DRIPS = [
  [47.6, 14.0, 154.91],
  [89.67, 20.86, 78.58],
  [118.22, 32.93, 147.62],
  [177.74, 25.38, 158.83],
  [228.79, 24.39, 123.51],
  [297.95, 18.81, 205.58],
  [346.26, 17.09, 142.26],
  [473.33, 26.94, 227.07],
  [587.72, 22.42, 86.09],
  [612.45, 18.79, 209.7],
  [701.0, 27.03, 175.35],
  [721.45, 24.53, 114.61],
  [870.31, 20.77, 221.28],
  [1005.56, 14.26, 106.69],
  [1082.04, 26.67, 205.49],
  [1133.73, 14.3, 142.99],
  [1158.7, 33.51, 169.2],
  [1223.84, 16.13, 186.01],
  [1280.35, 35.1, 130.9],
  [1343.69, 33.83, 73.56],
];
const FIGMA_FONT_SIZE = 245.697; // Titlens skriftstørrelse i Figma
const PATTERN_WIDTH = 1380; // Bredden af hele mønstret = CLAYFACE i Figma
const LETTER_WIDTH = PATTERN_WIDTH / 8; // Gennemsnitlig bredde af ét bogstav (172.5px)

// Figma-px → em, så dråberne vokser og krymper med titlen.
// 1em = titlens skriftstørrelse, så fx 245.697px i Figma bliver præcis 1em – uanset om titlen er 208px eller 64px.
function toEm(px) {
  return `${px / FIGMA_FONT_SIZE}em`;
}

// Dråberne under ét ord. Korte ord får kun de dråber, der kan være under dem,
// lange ord får mønstret igen efter hver 8. bogstav.
function MeltDrips({ letters }) {
  // Ordets omtrentlige bredde i Figma-px, fx CLAYFACE: 8 × 172.5 = 1380
  const wordWidth = letters * LETTER_WIDTH;
  const drips = [];

  // Den ydre løkke lægger mønstret ud – først ved 0, så ved 1380 (efter 8 bogstaver), 2760 osv.
  for (let start = 0; start < wordWidth; start += PATTERN_WIDTH) {
    // Den indre løkke går gennem de 20 dråber. [left, width, height] pakker hver række ud i tre variabler.
    for (const [left, width, height] of DRIPS) {
      // Kun dråber, der slutter inden for ordet
      if (start + left + width <= wordWidth) {
        drips.push({ left: start + left, width, height });
      }
    }
  }

  // Hver dråbe er et tomt <span>. Placeringen sendes som CSS-variabler (--left, --width, --height),
  // som MovieTitle.module.css bruger. aria-hidden: dråberne er pynt, så skærmlæsere springer dem over.
  return drips.map((drip) => (
    <span
      key={drip.left}
      className={styles.drip}
      aria-hidden="true"
      style={{ "--left": toEm(drip.left), "--width": toEm(drip.width), "--height": toEm(drip.height) }}
    />
  ));
}

// "The Hunger Games: Sunrise on the Reaping" → ["The Hunger Games", "Sunrise on the Reaping"]
// Uden kolon: [null, hele titlen]
function splitSeries(title) {
  const index = title.indexOf(": ");
  if (index === -1) {
    return [null, title];
  }
  return [title.slice(0, index), title.slice(index + 2)];
}
