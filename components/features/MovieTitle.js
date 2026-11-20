import { Fragment } from "react";
import { splitSeries } from "@/lib/format";
import styles from "./MovieTitle.module.css";

/**
 * Titlen øverst på filmsiden
 *
 *   standard – alle film. Figma "Titel – standard" (3063:14531)
 *   katten   – KAMPAGNE, kun Katten med Hatten. Figma "Titel – hopper" (1817:9681)
 *   clayface – KAMPAGNE, kun Clayface. Figma "Titel – smelter" (1797:9068 / 1797:9099)
 *
 * kolon i titlen → delen før bliver en lille overtitel
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.id] id på h1 (til aria-labelledby)
 * @param {"standard" | "katten" | "clayface"} [props.variant="standard"]
 */
export default function MovieTitle({ title, id, variant = "standard" }) {
  const [series, name] = splitSeries(title);
  const words = name.split(" ");
  let letterCount = 0;

  return (
    <div className={styles.titleBlock}>
      {series && <p className={styles.series}>{series}</p>}
      {/* aria-label: skærmlæsere læser titlen samlet, selv om bogstaverne er delt op */}
      <h1 id={id} className={styles.title} data-variant={variant} aria-label={variant === "katten" ? name : undefined}>
        {words.map((word, index) => (
          <Fragment key={index}>
            {index > 0 && " "}
            <span className={styles.word} style={{ "--index": index }}>
              {variant === "katten"
                ? word.split("").map((letter) => {
                    const number = letterCount;
                    letterCount = letterCount + 1;
                    return <HopLetter key={number} letter={letter} number={number} />;
                  })
                : word}
              {variant === "clayface" && <MeltDrips letters={word.length} />}
            </span>
          </Fragment>
        ))}
      </h1>
    </div>
  );
}

// ---------- KAMPAGNE: KATTEN MED HATTEN ----------

// hvor højt hvert bogstav hopper og hvor meget det drejer (fra Figma). starter forfra efter 6
const HOPS = [
  { up: "-0.29em", turn: "-6deg" },
  { up: "-0.05em", turn: "5deg" },
  { up: "-0.22em", turn: "-4deg" },
  { up: "0.03em", turn: "7deg" },
  { up: "-0.23em", turn: "-3deg" },
  { up: "-0.08em", turn: "4deg" },
];

const HOP_COLORS = [
  "var(--color-title-hop-red)",
  "var(--color-title-hop-blue)",
  "var(--color-title-hop-yellow)",
  "var(--color-title-hop-ink)",
];

function HopLetter({ letter, number }) {
  // % → listen starter forfra, når den er brugt op
  const hop = HOPS[number % HOPS.length];
  const color = HOP_COLORS[number % HOP_COLORS.length];

  return (
    <span
      className={styles.letter}
      aria-hidden="true"
      style={{ "--number": number, "--up": hop.up, "--turn": hop.turn, "--color": color }}
    >
      {letter}
    </span>
  );
}

// ---------- KAMPAGNE: CLAYFACE ----------

// dråberne fra Figma: [left, width, height] i px, tegnet under CLAYFACE (8 bogstaver) ved 245.697px
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
const FIGMA_FONT_SIZE = 245.697;
const PATTERN_WIDTH = 1380; // bredden af CLAYFACE i Figma
const LETTER_WIDTH = PATTERN_WIDTH / 8;

// px → em, så dråberne følger titlens størrelse
function toEm(px) {
  return `${px / FIGMA_FONT_SIZE}em`;
}

// dråber under ét ord. lange ord får mønstret igen efter 8 bogstaver
function MeltDrips({ letters }) {
  const wordWidth = letters * LETTER_WIDTH;
  const drips = [];

  for (let start = 0; start < wordWidth; start += PATTERN_WIDTH) {
    for (const [left, width, height] of DRIPS) {
      // kun dråber, der slutter inden for ordet
      if (start + left + width <= wordWidth) {
        drips.push({ left: start + left, width, height });
      }
    }
  }

  return drips.map((drip) => (
    <span
      key={drip.left}
      className={styles.drip}
      aria-hidden="true"
      style={{ "--left": toEm(drip.left), "--width": toEm(drip.width), "--height": toEm(drip.height) }}
    />
  ));
}
