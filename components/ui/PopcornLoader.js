import { preload } from "react-dom";
import styles from "./PopcornLoader.module.css";

// Billederne, loaderen bruger: bægeret med bunken og de tre popkorn-former
const POPCORN_IMAGES = ["/popcorn/popkorn.svg", "/popcorn/pop-1.svg", "/popcorn/pop-2.svg", "/popcorn/pop-3.svg"];

// Hent billederne på forhånd. Loaderen vises tit kun et kort øjeblik - er billederne ikke hentet endnu,
// ser man kun overskriften. Kaldes af LoadingHost i layoutet, så billederne ligger klar, før en loader vises
export function preloadPopcorn() {
  POPCORN_IMAGES.forEach((href) => preload(href, { as: "image" }));
}

// De popkorn, der hopper op af bægeret. Tallene er placeringer i tegningen (viewBox 160 × 160):
//   form         - hvilken af de tre popkorn-former (public/popcorn/pop-1.svg … pop-3.svg)
//   topX, topY   - hvor langt det hopper op fra bægeret (minus = op / til venstre)
//   landX, landY - hvor det lander ved siden af bægeret
// Placeringerne er taget fra Figmas fire trin, så popkornene flyver i forskellige retninger.
const POPS = [
  { form: 1, topX: -30, topY: -70, landX: -56, landY: 40 },
  { form: 2, topX: 16, topY: -86, landX: 52, landY: 42 },
  { form: 3, topX: 48, topY: -58, landX: 70, landY: 36 },
  { form: 2, topX: -48, topY: -52, landX: -60, landY: 30 },
  { form: 1, topX: 32, topY: -80, landX: 58, landY: 40 },
];

// Popkorn-loaderen (Figma "Popcorn – loader", Trin 1-4): popkorn hopper op af bægeret ét ad gangen.
// Bægeret med bunken er én svg (popkorn.svg). Popkornene ligger bagved, så de kommer op inde fra bægeret.
// Kun pynt, så skærmlæsere springer den over (aria-hidden).
export default function PopcornLoader() {
  return (
    <svg viewBox="0 0 160 160" className={styles.loader} aria-hidden="true">
      {POPS.map((pop, index) => (
        <image
          key={index}
          href={`/popcorn/pop-${pop.form}.svg`}
          // Starter midt i bægeret (bag bunken)
          x="70"
          y="78"
          width="20"
          height="20"
          className={styles.pop}
          // Tallene sendes til CSS'en som variabler. --index forskyder popkornene i tid
          style={{
            "--top-x": `${pop.topX}px`,
            "--top-y": `${pop.topY}px`,
            "--land-x": `${pop.landX}px`,
            "--land-y": `${pop.landY}px`,
            "--index": index,
            "--count": POPS.length,
          }}
        />
      ))}
      <image href="/popcorn/popkorn.svg" x="0" y="0" width="160" height="160" className={styles.bucket} />
    </svg>
  );
}
