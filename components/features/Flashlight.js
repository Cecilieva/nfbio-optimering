// "use client" gør det til en klientkomponent: den kører i browseren, fordi den skal lytte efter musen
// og bruge state (useState) og effekter (useEffect). Serverkomponenter kan ikke reagere på brugeren.
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Flashlight.module.css";

// Figma "Lommelygte" (node 570:3160) er tegnet i en ramme på 1440 × 560 px. Positionerne nedenfor er midten af
// lyset som en andel af rammens bredde (x) og højde (y) – fx 820 / 1440 ≈ 0,57 = 57 % inde fra venstre.
// Andele (0–1) i stedet for px gør, at lyset rammer samme sted, uanset hvor bred skærmen er.

// "Position=Auto 1–4": lyset vandrer selv mellem de fire punkter, når musen ikke er over heroen
const AUTO_POSITIONS = [
  { x: 820 / 1440, y: 230 / 560 },
  { x: 300 / 1440, y: 220 / 560 },
  { x: 900 / 1440, y: 400 / 560 },
  { x: 1180 / 1440, y: 260 / 560 },
];

// "Position=1–9": rammen deles i 3 × 3 zoner, og lyset hopper til midten af den zone, musen er over
const ZONES = 3;

// Hvor længe lyset bliver ved hvert auto-punkt, før det går videre (millisekunder – 2000 ms = 2 sekunder)
const AUTO_STEP_MS = 2000;

/**
 * Lommelygten: billedet ligger i mørke, og kun en blød lyskegle viser det.
 * Figma: "Lommelygte" (node 570:3160) fra Clayface-temaet – "FLYT LYGTEN".
 * Lyset følger musen zone for zone (Position 1–9) og vandrer selv rundt, når musen ikke er over (Auto 1–4).
 * Bruges i MovieHero til kommende thrillere og gysere i stedet for projektoren.
 *
 * @param {object} props
 * @param {string} props.image Billedet, der lyses op
 */
export default function Flashlight({ image }) {
  // ref peger på lommelygtens <div> i DOM'en, så vi kan finde heroen udenom (dens forælder)
  const ref = useRef(null);
  // Zonen under musen ({ col, row } = kolonne og række 0–2), eller null, når lyset kører af sig selv
  const [zone, setZone] = useState(null);
  // Hvilket af de fire auto-punkter lyset er ved lige nu (0–3)
  const [autoIndex, setAutoIndex] = useState(0);

  // Lyt på hele heroen (forælderen), så lyset også følger musen hen over titlen og knapperne.
  // Den tomme liste [] til sidst betyder, at effekten kun kører én gang, når komponenten vises.
  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (!hero) {
      return;
    }

    function handleMove(event) {
      // Kun en rigtig mus flytter lyset – på touchskærme bliver det ved med at vandre af sig selv
      if (event.pointerType !== "mouse") {
        return;
      }
      // Musens position inde i heroen som andel (0–1) ganget med 3 og rundet ned giver zonen 0, 1 eller 2
      const box = hero.getBoundingClientRect();
      const col = clampZone(Math.floor(((event.clientX - box.left) / box.width) * ZONES));
      const row = clampZone(Math.floor(((event.clientY - box.top) / box.height) * ZONES));
      // Opdatér kun, når zonen skifter, så komponenten ikke tegnes om for hver eneste pixel, musen flytter sig
      setZone((current) => (current?.col === col && current?.row === row ? current : { col, row }));
    }

    // Musen forlader heroen: tilbage til at vandre af sig selv
    function handleLeave() {
      setZone(null);
    }

    hero.addEventListener("pointermove", handleMove);
    hero.addEventListener("pointerleave", handleLeave);
    // Oprydning: fjern lytterne igen, når komponenten forsvinder fra siden
    return () => {
      hero.removeEventListener("pointermove", handleMove);
      hero.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  // Auto 1 → 2 → 3 → 4 → 1 … så længe musen er væk. Ikke for dem, der har slået animationer fra.
  // Effekten kører igen, hver gang zone ændrer sig ([zone]) – så timeren stopper, når musen kommer ind.
  useEffect(() => {
    if (zone || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // % AUTO_POSITIONS.length (rest ved division med 4) får tallet til at starte forfra: 0, 1, 2, 3, 0, 1 …
    const timer = setInterval(() => setAutoIndex((index) => (index + 1) % AUTO_POSITIONS.length), AUTO_STEP_MS);
    return () => clearInterval(timer);
  }, [zone]);

  // Lysets midtpunkt: midten af zonen under musen (+ 0.5 = midt i zonen), ellers det aktuelle auto-punkt
  const position = zone ? { x: (zone.col + 0.5) / ZONES, y: (zone.row + 0.5) / ZONES } : AUTO_POSITIONS[autoIndex];

  return (
    <div ref={ref} className={styles.flashlight} aria-hidden="true">
      {/* Figma "Billede" + "Mørke": billedet ligger helt i mørke */}
      <div className={styles.darkness} />

      {/* Figma "Kegle": det samme billede, men kun synligt gennem den bløde, runde maske.
          --light-x og --light-y sendes til CSS'en, som flytter masken derhen.
          data-mode vælger, hvor hurtigt lyset glider (langsomt af sig selv, hurtigt efter musen). */}
      <div
        className={styles.cone}
        data-mode={zone ? "follow" : "auto"}
        style={{ "--light-x": position.x, "--light-y": position.y }}
      >
        <img src={image} alt="" className={styles.image} />
      </div>
    </div>
  );
}

// Holder zonen inden for 0–2 – fx hvis musen står helt ude på kanten og regnestykket giver 3
function clampZone(value) {
  return Math.min(ZONES - 1, Math.max(0, value));
}
