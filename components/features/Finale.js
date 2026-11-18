"use client";

import { useEffect, useRef, useState } from "react";
import { FRAME_HEIGHT, FRAME_WIDTH, GLIMT_STARS, NEAR_STARS } from "@/components/features/finaleStars";
import styles from "./Finale.module.css";

// Sloganet, én linje ad gangen – som i Figma
const SLOGAN_LINES = ["We bring", "stories", "to life"];

/**
 * Finalen nederst på forsiden: Nordisk Films slogan i et stjernerum.
 * Figma: "Finale (motion)" (node 1883:12291).
 *
 * Lagene, nederst først:
 * 1. "Finale-rum": baggrunden og stjernefeltet. Toner frem og zoomer på plads, når man når ned til finalen.
 * 2. "Glimt": 14 små stjerner, hvoraf nogle blinker én gang pr. løkke.
 * 3. "Stjerner – nær": 46 stjerner tæt på, som svæver langsomt rundt og glimter.
 * 4. Sloganet "We bring stories to life": linjerne glider op én ad gangen, fra sløret til skarp.
 *
 * Alle tider og easings står i Finale.module.css og tokens.css, stjernerne i finaleStars.js.
 * Animationerne venter, til finalen kommer ind på skærmen, så man ser starten.
 * Har man slået animationer fra i styresystemet, står det hele stille (se CSS'en).
 */
export default function Finale() {
  const sectionRef = useRef(null);
  // "waiting": finalen er ikke set endnu – animationerne er sat på pause.
  // "playing": den er kommet ind på skærmen, og animationerne kører.
  const [state, setState] = useState("waiting");

  // Start animationerne, når en fjerdedel af finalen kan ses. Derefter holder vi op med at kigge.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("playing");
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.finale} data-state={state} aria-label="Nordisk Film">
      {/* 1. Figma "Finale-rum": baggrund og stjernefelt. Pynt, så skærmlæsere springer det over. */}
      <div className={styles.room} aria-hidden="true">
        <img src="/finale/stjerner.svg" alt="" className={styles.starField} />

        {/* 2. Figma "Glimt": små stjerner. data-blink vælger animationen i CSS'en. */}
        {GLIMT_STARS.map((star, index) => (
          <span
            key={index}
            className={styles.glimt}
            data-blink={star.blink ?? undefined}
            style={{ top: `${star.top}%`, left: `${star.left}%` }}
          />
        ))}
      </div>

      {/* 3. Figma "Stjerner – nær". Placeringen regnes om fra px i Figmas ramme til %, så de fylder enhver skærm. */}
      <div className={styles.near} aria-hidden="true">
        {NEAR_STARS.map((star, index) => (
          <span
            key={index}
            className={styles.star}
            data-dips={star.twinkle?.dips}
            style={{
              left: `${(star.x / FRAME_WIDTH) * 100}%`,
              top: `${(star.y / FRAME_HEIGHT) * 100}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              "--star-opacity": star.opacity,
              // Hvornår stjernen begynder at glimte i løkken (en brøkdel af de 8 sekunder)
              "--twinkle-start": star.twinkle?.start,
            }}
          />
        ))}
      </div>

      {/* 4. Sloganet. lang="en", så skærmlæsere udtaler det på engelsk. --line styrer, hvornår linjen kommer. */}
      <p className={styles.slogan} lang="en">
        {SLOGAN_LINES.map((line, index) => (
          <span key={line} className={styles.line} style={{ "--line": index }}>
            {line}
          </span>
        ))}
      </p>
    </section>
  );
}
