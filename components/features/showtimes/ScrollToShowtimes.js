"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/features/SmoothScroll";

// Adressen fra "Se spilletider" på plakaterne, fx /film/clayface#vis-spilletider.
// Der findes ikke et element med det id, så hverken Next.js eller browseren hopper derned af sig selv –
// det gør komponenten her i stedet, med en blød scroll.
export const SHOWTIMES_HASH = "#vis-spilletider";

// Overskriften "Spilletider" har id="spilletider" (ShowtimeList)
const TARGET_ID = "spilletider";
// Siden når lige at blive vist, før den begynder at scrolle (ms)
const START_DELAY = 400;
// Hvor lang tid scrollen tager (sekunder)
const SCROLL_DURATION = 1.4;

/**
 * Kommer man til filmsiden fra "Se spilletider", scroller siden blødt ned til spilletiderne.
 * Viser ikke noget selv. Ligger på filmsiden (app/(site)/film/[slug]/page.js).
 *
 * Bagefter skiftes adressen til #spilletider, så en genindlæsning eller et link lander samme sted.
 * Har man bedt om mindre bevægelse, hopper siden derned med det samme.
 */
export default function ScrollToShowtimes() {
  const lenis = useLenis();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || window.location.hash !== SHOWTIMES_HASH) {
      return;
    }
    const target = document.getElementById(TARGET_ID);
    if (!target) {
      return;
    }

    // Skift adressen til #spilletider uden at hoppe
    const showHash = () => history.replaceState(history.state, "", `#${TARGET_ID}`);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current = true;
      target.scrollIntoView({ block: "start" });
      showHash();
      return;
    }

    // Lenis (blød scroll) er ikke klar ved første render – vent på den
    if (!lenis) {
      return;
    }

    // Lidt luft over overskriften (samme som --space-10)
    const offset = -parseFloat(getComputedStyle(document.documentElement).fontSize) * 2.5;
    // done sættes først, når scrollen starter, så den ikke springes over, hvis effekten kører igen
    const timer = setTimeout(() => {
      done.current = true;
      lenis.scrollTo(target, {
        offset,
        duration: SCROLL_DURATION,
        // Går blødt i gang og blødt i stå
        easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
        onComplete: showHash,
      });
    }, START_DELAY);
    return () => clearTimeout(timer);
  }, [lenis]);

  return null;
}
