"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Flashlight.module.css";

// positioner som andel (0–1) af Figma-rammen på 1440 × 560, så de passer på alle skærme
const AUTO_POSITIONS = [
  { x: 820 / 1440, y: 230 / 560 },
  { x: 300 / 1440, y: 220 / 560 },
  { x: 900 / 1440, y: 400 / 560 },
  { x: 1180 / 1440, y: 260 / 560 },
];

// 3 × 3 zoner. lyset hopper til midten af zonen under musen
const ZONES = 3;
const AUTO_STEP_MS = 2000;

/**
 * KAMPAGNE: CLAYFACE – kun på Clayface-filmsiden
 * Lommelygten: billedet i mørke, kun lyskeglen viser det. Figma "Lommelygte" (570:3160)
 * Følger musen zone for zone – ellers vandrer den selv
 *
 * @param {object} props
 * @param {string} props.image
 */
export default function Flashlight({ image }) {
  const ref = useRef(null);
  // null = musen er ikke over heroen
  const [zone, setZone] = useState(null);
  const [autoIndex, setAutoIndex] = useState(0);

  // lytter på hele heroen, så det også virker over titel og knapper
  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (!hero) {
      return;
    }

    function handleMove(event) {
      // kun mus – på touch vandrer lyset selv
      if (event.pointerType !== "mouse") {
        return;
      }
      const box = hero.getBoundingClientRect();
      const col = clampZone(Math.floor(((event.clientX - box.left) / box.width) * ZONES));
      const row = clampZone(Math.floor(((event.clientY - box.top) / box.height) * ZONES));
      // opdater kun, når zonen skifter
      setZone((current) => (current?.col === col && current?.row === row ? current : { col, row }));
    }

    function handleLeave() {
      setZone(null);
    }

    hero.addEventListener("pointermove", handleMove);
    hero.addEventListener("pointerleave", handleLeave);
    return () => {
      hero.removeEventListener("pointermove", handleMove);
      hero.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  // vandrer selv, når musen er væk (ikke hvis animationer er slået fra)
  useEffect(() => {
    if (zone || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = setInterval(() => setAutoIndex((index) => (index + 1) % AUTO_POSITIONS.length), AUTO_STEP_MS);
    return () => clearInterval(timer);
  }, [zone]);

  const position = zone ? { x: (zone.col + 0.5) / ZONES, y: (zone.row + 0.5) / ZONES } : AUTO_POSITIONS[autoIndex];

  return (
    <div ref={ref} className={styles.flashlight} aria-hidden="true">
      <div className={styles.darkness} />

      {/* billedet ses kun gennem masken. CSS flytter masken ud fra --light-x/y */}
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

// helt ude på kanten giver ellers 3
function clampZone(value) {
  return Math.min(ZONES - 1, Math.max(0, value));
}
