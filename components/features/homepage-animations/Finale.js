"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Starfield from "@/components/features/homepage-animations/Starfield";
import styles from "./Finale.module.css";

// Sloganet, én linje ad gangen – som i Figma
const SLOGAN_LINES = ["We bring", "stories", "to life"];

// Scroll-animationen (GSAP bruger tal, så de står her og ikke i tokens.css)
const SLOGAN_LIFT = 60; // Sloganet glider de sidste 60px op på plads …
const PIN_LENGTH = "+=55%"; // … mens sektionen står fast i 55 % af en skærmhøjde
const LETTER_START_OPACITY = 0.12; // Bogstaverne starter svagt og lyses op ét ad gangen
const REFRESH_DELAY = 150; // ms – hvor længe vi venter, før siden måles igen, når den har ændret højde

/**
 * Finalen nederst på forsiden: Nordisk Films slogan i et stjernerum – samme rum og stjerner som hero'en.
 * Figma: "Finale (motion)".
 *
 * Mens man scroller:
 * 1. Bogstaverne lyses op ét ad gangen. Det starter, når sloganet tydeligt kan ses,
 *    og er færdigt, når finalen fylder skærmen.
 * 2. Så står finalen fast et øjeblik (pin) med sloganet helt tændt, mens det glider op på plads.
 * Det hele følger scrollen (scrub), så det kører baglæns, når man scroller op.
 *
 * Har man slået animationer fra i styresystemet, står sloganet bare der i fuldt lys.
 */
export default function Finale() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const sloganRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // gsap.context samler animationerne, så de alle kan fjernes igen med ctx.revert()
    const ctx = gsap.context(() => {
      const letters = sloganRef.current.querySelectorAll(`.${styles.letter}`);
      // Første linje i sloganet ("We bring") – bogstaverne begynder først at lyse, når den kan ses
      const firstLine = sloganRef.current.querySelector(`.${styles.line}`);

      // Sektionen står fast, mens sloganet glider op på plads
      gsap.fromTo(
        sloganRef.current,
        { y: SLOGAN_LIFT },
        {
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: stageRef.current, start: "top top", end: PIN_LENGTH, scrub: true, pin: true },
        },
      );

      // Bogstaverne lyses op ét ad gangen: starter, når toppen af første linje er 80 % nede på skærmen
      // (så den tydeligt kan ses), og er færdige, når finalen fylder skærmen og står fast.
      // Så står sloganet helt tændt under pinnen, og man kan nå at læse det, før man scroller videre.
      gsap.fromTo(
        letters,
        { opacity: LETTER_START_OPACITY },
        {
          opacity: 1,
          ease: "none",
          duration: 1,
          stagger: { each: 1, ease: "none" },
          scrollTrigger: {
            trigger: firstLine,
            start: "top 80%",
            endTrigger: stageRef.current,
            end: "top top",
            scrub: 0.3,
          },
        },
      );
    }, rootRef);

    // Bliver siden over finalen højere eller lavere (fx når "Kommende film" folder sig ud, eller man trykker
    // "Se flere film"), flytter finalen sig. GSAP skal så måle igen – ellers sættes den fast det forkerte sted.
    // Vi venter lidt (REFRESH_DELAY), så der kun måles én gang, når flere ting ændrer sig lige efter hinanden.
    let lastHeight = document.body.offsetHeight;
    let timer;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const height = document.body.offsetHeight;
        if (height !== lastHeight) {
          lastHeight = height;
          ScrollTrigger.refresh();
        }
      }, REFRESH_DELAY);
    });
    resizeObserver.observe(document.body);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.finale} aria-label="Nordisk Film">
      <div ref={stageRef} className={styles.stage}>
        <Starfield />

        {/* Skærmlæsere læser hele sloganet fra aria-label – ikke ét bogstav ad gangen.
            lang="en", så det udtales på engelsk. */}
        <h2 ref={sloganRef} className={styles.slogan} lang="en" aria-label={SLOGAN_LINES.join(" ")}>
          {SLOGAN_LINES.map((line) => (
            <span key={line} className={styles.line} aria-hidden="true">
              {line.split(" ").map((word, w) => (
                <span key={w}>
                  {w > 0 && " "}
                  {/* Ordet holdes samlet, så det ikke knækker midt i */}
                  <span className={styles.word}>
                    {[...word].map((letter, l) => (
                      <span key={l} className={styles.letter}>
                        {letter}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
