"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ComingSoonCard from "@/components/features/ComingSoonCard";
import IntroAnimation from "@/components/features/IntroAnimation";
import styles from "./FeaturedCarousel.module.css";

// How long each film is shown before the next one fades in
const SLIDE_MS = 7000;

/**
 * Det store "Kommer snart"-kort øverst på forsiden, der roligt skifter mellem de fremhævede film.
 * Ved hvert skift glider det nye kort op nedefra og lægger sig oven på det gamle,
 * som trækker sig lidt tilbage og bliver mørkere nedenunder – som lag, der bliver lagt ovenpå.
 * Figma: "Kommer snart"-karrusel (node 11:34).
 *
 * Introen ligger her, fordi karrusellen først må begynde at skifte, når introen er færdig, og fordi
 * introen slutter med, at det første kort vokser frem (revealRef).
 * Karrusellen kører videre, også når man har scrollet ned, så der står en ny film, når man kommer op igen.
 * Den holder kun pause, mens man står i kortet med tastaturet (Tab). Kortet fylder næsten hele skærmen,
 * så en pause, når musen er over det, ville få karrusellen til næsten aldrig at skifte.
 *
 * @param {object} props
 * @param {object[]} props.movies Filmene i den rækkefølge, de vises (se lib/data/featured.js)
 */
export default function FeaturedCarousel({ movies }) {
  // Kortet, der vises nu, og kortet, det lige har lagt sig oven på (null før første skift)
  const [{ active, previous }, setSlides] = useState({ active: 0, previous: null });
  // Karrusellen starter først, når introen er væk
  const [started, setStarted] = useState(false);
  // En ref i stedet for state, så kortet ikke tegnes om, når fokus flytter
  const paused = useRef(false);
  // Selve karrusellen – introen lader den vokse frem fra Sunrise-plakaten
  const carouselRef = useRef(null);

  // useCallback: samme funktion hver gang, så introens effekt ikke kører igen ved hver ændring her
  const handleIntroDone = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!started || movies.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      if (!paused.current) {
        setSlides((slides) => ({ active: (slides.active + 1) % movies.length, previous: slides.active }));
      }
    }, SLIDE_MS);
    // Stop timeren, når komponenten forsvinder
    return () => clearInterval(timer);
  }, [started, movies.length]);

  // Kun tastatur-fokus (:focus-visible) giver pause. Et museklik, fx på "Følg film", gør ikke.
  function handleFocus(event) {
    paused.current = event.target.matches(":focus-visible");
  }

  // Fokus flytter rundt inde i kortet: hold kun pause, så længe fokus stadig er inde i det
  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      paused.current = false;
    }
  }

  return (
    <>
      <IntroAnimation revealRef={carouselRef} onDone={handleIntroDone} />

      <div
        ref={carouselRef}
        className={styles.carousel}
        aria-roledescription="karrusel"
        aria-label="Kommer snart"
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {/* Alle kort ligger oven på hinanden. data-state styrer animationen i CSS'en:
              "shown"    – det første kort, før karrusellen er gået i gang (ingen animation)
              "entering" – det nye kort, der glider ind øverst
              "covered"  – det gamle kort, der ligger nedenunder
              "hidden"   – resten
            Kun det aktive kort kan man klikke og tabbe ind i – de andre er "inert". */}
        {movies.map((movie, index) => (
          <div
            key={movie.slug}
            className={styles.slide}
            data-state={getSlideState(index, active, previous)}
            inert={index !== active}
            role="group"
            aria-roledescription="dias"
            aria-label={`${index + 1} af ${movies.length}: ${movie.title}`}
          >
            <ComingSoonCard movie={movie} />
          </div>
        ))}
      </div>
    </>
  );
}

function getSlideState(index, active, previous) {
  if (index === active) {
    return previous === null ? "shown" : "entering";
  }
  return index === previous ? "covered" : "hidden";
}
