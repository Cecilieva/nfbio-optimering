import styles from "./PopcornLoader.module.css";

// Billederne, loaderen bruger: bægeret med bunken og de tre popkorn-former
const POPCORN_IMAGES = ["/popcorn/popkorn.svg", "/popcorn/pop-1.svg", "/popcorn/pop-2.svg", "/popcorn/pop-3.svg"];

// Henter billederne på forhånd, så de ligger klar, når loaderen vises (ellers ser man kun overskriften).
// Kaldes af LoadingHost, når siden er vist. new Image() i stedet for <link rel="preload">,
// fordi browseren ellers advarer, når billederne ikke bliver brugt med det samme
export function preloadPopcorn() {
  POPCORN_IMAGES.forEach((src) => {
    new Image().src = src;
  });
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

// Røgen over de brændte popkorn (rog-1…3.svg): placering i tegningen. Minus i y = over boksen
const SMOKE = [
  { x: 56, y: 4, width: 24, height: 48 },
  { x: 78, y: -20, width: 27.6, height: 55.2 },
  { x: 96, y: -8, width: 21.6, height: 43.2 },
];

// Popkorn-loaderen (Figma "Popcorn – loader", Trin 1-4): popkorn hopper op af bægeret ét ad gangen.
// Bægeret med bunken er én svg (popkorn.svg). Popkornene ligger bagved, så de kommer op inde fra bægeret.
// Kun pynt, så skærmlæsere springer den over (aria-hidden).
//
//   burnt - true: brændte popkorn med røg i stedet (fx når betalingen fejler)
export default function PopcornLoader({ burnt = false }) {
  if (burnt) {
    return (
      <svg viewBox="0 0 160 160" className={styles.loader} aria-hidden="true">
        <image href="/popcorn/braendt.svg" x="0" y="0" width="160" height="160" />
        {SMOKE.map((smoke, index) => (
          <image
            key={index}
            href={`/popcorn/rog-${index + 1}.svg`}
            // x, y, width og height
            {...smoke}
            className={styles.smoke}
            // --index: striberne kommer én ad gangen
            style={{ "--index": index, "--count": SMOKE.length }}
          />
        ))}
      </svg>
    );
  }

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
