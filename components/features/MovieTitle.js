import { Fragment } from "react";
import styles from "./MovieTitle.module.css";

/**
 * Titlen øverst på filmsiden
 *
 *   standard – Figma "Titel – standard" (3063:14531)
 *              glider op når siden loader + bølge hvert 4. sek
 *   melt     – Figma "Titel – smelter" (1797:9068 / 1797:9099), kun kommende thrillere/gysere
 *              store versaler med dråber der løber ned og trækker sig op igen (MeltDrips)
 *
 * kolon i titlen → delen før bliver lille overtitel ("Univers titel")
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.id] id på h1 (til aria-labelledby)
 * @param {"standard" | "melt"} [props.variant="standard"]
 */
export default function MovieTitle({ title, id, variant = "standard" }) {
  // overtitel + titel (splitSeries nederst)
  const [series, name] = splitSeries(title);
  // span pr. ord → bølgen + dråber pr. ord
  const words = name.split(" ");

  return (
    <div className={styles.titleBlock}>
      {series && <p className={styles.series}>{series}</p>}
      {/* data-variant styres i css'en */}
      <h1 id={id} className={styles.title} data-variant={variant}>
        {words.map((word, index) => (
          // --index = forsinkelse pr. ord → bølgen går fra venstre
          // mellemrummet står som tekst så skærmlæsere/kopiering får hele titlen (afstanden er column-gap)
          <Fragment key={index}>
            {index > 0 && " "}
            <span className={styles.word} style={{ "--index": index }}>
              {word}
              {/* dråber kun på melt */}
              {variant === "melt" && <MeltDrips letters={word.length} />}
            </span>
          </Fragment>
        ))}
      </h1>
    </div>
  );
}

// dråberne fra figma "Dråber": [left, width, height] i px
// tegnet under CLAYFACE (8 bogstaver, 1380px) ved 245.697px
// start-position, blur osv. står i tokens.css
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

// px → em så dråberne følger titlens størrelse (245.697px = 1em)
function toEm(px) {
  return `${px / FIGMA_FONT_SIZE}em`;
}

// dråber under ét ord – korte ord får dem der passer, lange får mønstret igen efter 8 bogstaver
function MeltDrips({ letters }) {
  // ca. bredde i figma-px (CLAYFACE: 8 × 172.5 = 1380)
  const wordWidth = letters * LETTER_WIDTH;
  const drips = [];

  // mønstret ved 0, 1380, 2760 …
  for (let start = 0; start < wordWidth; start += PATTERN_WIDTH) {
    // de 20 dråber
    for (const [left, width, height] of DRIPS) {
      // kun dem der slutter inden for ordet
      if (start + left + width <= wordWidth) {
        drips.push({ left: start + left, width, height });
      }
    }
  }

  // tom span pr. dråbe, mål som css-variabler (MovieTitle.module.css)
  // aria-hidden = pynt
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
