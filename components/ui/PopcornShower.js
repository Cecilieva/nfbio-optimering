import styles from "./PopcornShower.module.css";

// Popkornene, der drysser over skærmen i stedet for konfetti. Tallene er fra Figma (en ramme på 1440 × 1024):
//   form  - hvilken af de tre popkorn-former (public/popcorn/pop-1.svg … pop-3.svg)
//   x, y  - hvor popkornet lander
//   rise  - hvor langt nede det starter (det flyver op)
//   start - hvornår det flyver op, regnet efter --delay-popcorn-shower: 0 = med det samme, 1 = en hel printtid senere
const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 1024;

const POPCORN = [
  { form: 2, x: 337.89, y: 334.26, rise: 404, start: 0.217 },
  { form: 3, x: 97.32, y: 560.77, rise: 178, start: 0.5515 },
  { form: 2, x: 333.81, y: 459.36, rise: 279, start: 0.3202 },
  { form: 1, x: 68.47, y: 603.65, rise: 135, start: 0.6013 },
  { form: 3, x: 167.64, y: 348.78, rise: 390, start: 0.523 },
  { form: 3, x: 256.63, y: 322.6, rise: 416, start: 0.4269 },
  { form: 1, x: 1399.58, y: 341.56, rise: 397, start: 0.6903 },
  { form: 1, x: 1092.72, y: 286.42, rise: 452, start: 0.2775 },
  { form: 2, x: 113.09, y: 589.04, rise: 150, start: 0.4661 },
  { form: 3, x: 1255.46, y: 354.44, rise: 384, start: 0.1494 },
  { form: 2, x: 1348.95, y: 271.36, rise: 467, start: 0.4732 },
  { form: 3, x: 336.11, y: 496.77, rise: 242, start: 0.16 },
  { form: 2, x: 1364.31, y: 597.33, rise: 141, start: 0.5124 },
  { form: 3, x: 29.21, y: 271.68, rise: 467, start: 0.2632 },
  { form: 3, x: 289.51, y: 317.19, rise: 422, start: 0.2205 },
  { form: 2, x: -4.1, y: 293.27, rise: 445, start: 0.7864 },
  { form: 2, x: 1272.68, y: 254.98, rise: 484, start: 0.6013 },
  { form: 3, x: 203.48, y: 479.63, rise: 259, start: 0.1707 },
  { form: 3, x: 1179.38, y: 205, rise: 534, start: 0.1992 },
  { form: 2, x: 105.14, y: 117.19, rise: 622, start: 0.1351 },
  { form: 1, x: 1179.64, y: 547.93, rise: 191, start: 0.5017 },
  { form: 1, x: 313.49, y: 272.47, rise: 466, start: 0.4234 },
  { form: 1, x: 194.04, y: 204.71, rise: 534, start: 0.644 },
  { form: 2, x: 147.97, y: 350.07, rise: 389, start: 0.6583 },
];

// Lægger popkornene ud over hele skærmen. De flyver op ét ad gangen og popper, når de lander.
// Placeringen er i procent, så de spredes ud over skærmen, uanset hvor stor den er.
// Kun pynt, så skærmlæsere springer den over (aria-hidden).
export default function PopcornShower() {
  return (
    <div className={styles.shower} aria-hidden="true">
      {POPCORN.map((pop, index) => (
        <img
          key={index}
          src={`/popcorn/pop-${pop.form}.svg`}
          alt=""
          className={styles.popcorn}
          style={{
            "--x": `${(pop.x / FRAME_WIDTH) * 100}%`,
            "--y": `${(pop.y / FRAME_HEIGHT) * 100}%`,
            "--rise": `${pop.rise}px`,
            "--start": pop.start,
          }}
        />
      ))}
    </div>
  );
}
