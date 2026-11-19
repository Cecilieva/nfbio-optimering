// client component – skal lytte efter musen + bruge state, det kan en server component ikke
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Flashlight.module.css";

// figma-rammen er 1440 × 560 → positioner som andel (0–1) af bredde/højde
// fx 820 / 1440 ≈ 0,57 = 57 % fra venstre. så passer det på alle skærme

// Auto 1–4: lyset vandrer selv mellem dem når musen er væk
const AUTO_POSITIONS = [
  { x: 820 / 1440, y: 230 / 560 },
  { x: 300 / 1440, y: 220 / 560 },
  { x: 900 / 1440, y: 400 / 560 },
  { x: 1180 / 1440, y: 260 / 560 },
];

// Position 1–9: 3 × 3 zoner, lyset hopper til midten af zonen under musen
const ZONES = 3;

// 2 sek ved hvert auto-punkt
const AUTO_STEP_MS = 2000;

/**
 * Lommelygten – billedet i mørke, kun lyskeglen viser det
 * Figma "Lommelygte" (570:3160), Clayface-temaet ("FLYT LYGTEN")
 * følger musen zone for zone, ellers vandrer den selv
 * bruges i MovieHero til kommende thrillere/gysere i stedet for projektoren
 *
 * @param {object} props
 * @param {string} props.image billedet der lyses op
 */
export default function Flashlight({ image }) {
  // ref til lommelygtens div → så jeg kan finde heroen (forælderen)
  const ref = useRef(null);
  // zonen under musen { col, row } (0–2), null = kører selv
  const [zone, setZone] = useState(null);
  // hvilket auto-punkt (0–3)
  const [autoIndex, setAutoIndex] = useState(0);

  // lytter på hele heroen så det også virker over titel og knapper
  // [] = kører kun én gang
  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (!hero) {
      return;
    }

    function handleMove(event) {
      // kun mus – på touch vandrer den bare selv
      if (event.pointerType !== "mouse") {
        return;
      }
      // position (0–1) × 3, rundet ned → zone 0, 1 eller 2
      const box = hero.getBoundingClientRect();
      const col = clampZone(Math.floor(((event.clientX - box.left) / box.width) * ZONES));
      const row = clampZone(Math.floor(((event.clientY - box.top) / box.height) * ZONES));
      // kun opdatere når zonen skifter, ellers re-render ved hver pixel
      setZone((current) => (current?.col === col && current?.row === row ? current : { col, row }));
    }

    // musen væk → tilbage til auto
    function handleLeave() {
      setZone(null);
    }

    hero.addEventListener("pointermove", handleMove);
    hero.addEventListener("pointerleave", handleLeave);
    // ryd op når komponenten forsvinder
    return () => {
      hero.removeEventListener("pointermove", handleMove);
      hero.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  // Auto 1 → 2 → 3 → 4 → 1 … når musen er væk (ikke ved reduced motion)
  // [zone] → stopper når musen kommer ind
  useEffect(() => {
    if (zone || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // % 4 → starter forfra: 0, 1, 2, 3, 0 …
    const timer = setInterval(() => setAutoIndex((index) => (index + 1) % AUTO_POSITIONS.length), AUTO_STEP_MS);
    return () => clearInterval(timer);
  }, [zone]);

  // midten af zonen (+0.5), ellers auto-punktet
  const position = zone ? { x: (zone.col + 0.5) / ZONES, y: (zone.row + 0.5) / ZONES } : AUTO_POSITIONS[autoIndex];

  return (
    <div ref={ref} className={styles.flashlight} aria-hidden="true">
      {/* "Billede" + "Mørke" */}
      <div className={styles.darkness} />

      {/* "Kegle": samme billede, men kun synligt gennem masken
          --light-x/y → css flytter masken
          data-mode → langsom (auto) eller hurtig (følger musen) */}
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

// holder zonen på 0–2 (helt ude på kanten giver ellers 3)
function clampZone(value) {
  return Math.min(ZONES - 1, Math.max(0, value));
}
