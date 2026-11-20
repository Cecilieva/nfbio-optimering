"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ComingSoonCard from "@/components/features/ComingSoonCard";
import HeroScroll from "@/components/features/homepage-animations/HeroScroll";
import styles from "./FeaturedMovies.module.css";

// Hvor meget mere af billedets bund (og mindre af toppen) et kort viser (se lift i ParallaxFrame).
// Sunrise: mere af teltene og græsset, mindre himmel.
const IMAGE_LIFT = { "sunrise-on-the-reaping": 0.35 };

// Antal plakater, der svæver forbi i stjernehimlen, før den sidste folder sig ud til kort 1
const INTRO_POSTER_COUNT = 8;

/**
 * Toppen af forsiden: hero'en (HeroScroll) og de store "Kommer snart"-kort under hinanden.
 * Figma: "Kommer snart"-karrusel (node 11:34). Filmene vælges i lib/data/featured.js.
 *
 * Man scroller selv igennem kortene – ingen pin, ingen snap:
 * - Hero'ens sidste plakat folder sig ud til kort 1 og bytter med det, når hero'en slipper.
 *   Derfor er sektionen trukket en skærmhøjde op, så kort 1 står præcis, hvor hero'en var.
 * - Kort 2 og 3 vokser ind (scale 0,9 → 1), og titlen skærpes ind bogstav for bogstav og sløres ud igen,
 *   når kortet forlader skærmen. Kort 1 starter skarpt og sløres kun ud.
 * - "Om X dage" tæller op første gang, kort 2 og 3 ses. Kort 1 tæller ikke, så tallet passer med plakaten ved byttet.
 * - Prikkerne i højre side viser det kort, der står tættest på midten af skærmen (ikke på mobil).
 * - Animationerne følger scrollen. "scrub" betyder, at de kører frem, når man scroller ned, og baglæns,
 *   når man scroller op. Scale og blur er udjævnet lidt (scrub: 0.6), så de aldrig hakker.
 *
 * Har man bedt om mindre bevægelse, står kortene bare under hinanden – uden hero og effekter.
 *
 * @param {object} props
 * @param {object[]} props.movies Filmene i den rækkefølge, de vises (se lib/data/featured.js)
 * @param {{ slug: string, src: string }[]} [props.introPosters] Plakaterne til stjernehimlen i tilfældig
 *   rækkefølge (se lib/data/intro-posters.js)
 */
export default function FeaturedMovies({ movies, introPosters = [] }) {
  const sectionRef = useRef(null);
  const firstCardRef = useRef(null);
  const dotsRef = useRef(null);
  const first = movies[0];

  // Stjernehimlens plakater: de første 8 fra den blandede liste – uden kort 1's film, for den er den sidste
  // plakat. Den sidste har ikke sit eget billede: HeroScroll viser kort 1's hero-billede (targetImage) i den,
  // så den bare strækker sig ud til kortet. useMemo: samme liste ved hver render, så animationen ikke starter forfra.
  const films = useMemo(
    () => [
      ...introPosters
        .filter((poster) => poster.slug !== first?.slug)
        .slice(0, INTRO_POSTER_COUNT)
        .map((poster) => ({ src: poster.src })),
      { position: "50% 50%" },
    ],
    [introPosters, first?.slug],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const cards = [...section.querySelectorAll("[data-featured-card]")];
    const dots = [...dotsRef.current.children];

    // Animationerne halter 0,6 sekund efter scrollen, så de føles bløde og aldrig hakker
    const SCRUB = 0.6;

    const ctx = gsap.context(() => {
      cards.forEach((card, index) => {
        // Bogstaverne i titlen (data-char) og resten af teksten og knapperne (data-reveal) – se ComingSoonCard
        const chars = card.querySelectorAll("[data-char]");
        const rest = card.querySelectorAll("[data-reveal]");

        if (index === 0) {
          // Kort 1 kommer skarpt fra hero'en og sløres kun ud, når man scroller videre.
          // Tidslinjen: først en pause (75 %), så sløres bogstaverne ét ad gangen (stagger), og resten tones ud.
          // immediateRender: false betyder, at teksten ikke sløres fra start – først når tidslinjen når dertil.
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: "top top", end: "bottom 10%", scrub: SCRUB } })
            .to({}, { duration: 0.75 })
            .fromTo(
              chars,
              { opacity: 1, filter: "blur(0px)" },
              { opacity: 0.15, filter: "blur(18px)", stagger: 0.005, duration: 0.3, immediateRender: false },
            )
            .fromTo(rest, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, "<");
        } else {
          // Kortet vokser let ind, mens det kommer op på skærmen
          gsap.fromTo(
            card,
            { scale: 0.9 },
            {
              scale: 1,
              ease: "none",
              force3D: true,
              scrollTrigger: { trigger: card, start: "top bottom", end: "top 12%", scrub: SCRUB },
            },
          );

          // Titlen skærpes ind og sløres ud igen – som fokus på et objektiv.
          // Tidslinjen: bogstaverne skærpes ét ad gangen, resten tones ind, en pause, mens kortet står midt
          // på skærmen, og så sløres det hele ud igen, når kortet forlader skærmen.
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: "top 85%", end: "bottom 15%", scrub: SCRUB } })
            .fromTo(chars, { opacity: 0.15, filter: "blur(18px)" }, { opacity: 1, filter: "blur(0px)", stagger: 0.01, duration: 0.35 })
            .fromTo(rest, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", stagger: 0.02, duration: 0.25 }, 0.1)
            .to({}, { duration: 0.3 })
            .to(chars, { opacity: 0.15, filter: "blur(18px)", stagger: 0.005, duration: 0.3 })
            .to(rest, { opacity: 0, duration: 0.2 }, "<");

          // "Om X dage" tæller op fra 0 første gang, kortet ses (once: true = kun én gang)
          card.querySelectorAll("[data-days]").forEach((element) => {
            const days = Number(element.dataset.days);
            const counter = { value: 0 };
            element.textContent = "0";
            ScrollTrigger.create({
              trigger: card,
              start: "top 40%",
              once: true,
              onEnter: () => {
                gsap.to(counter, {
                  value: days,
                  duration: 1.2,
                  ease: "power3.out",
                  onUpdate: () => {
                    element.textContent = String(Math.round(counter.value));
                  },
                });
              },
            });
          });
        }

      });

      // Prikkerne vises kun, mens man er ved kortene. Den aktive prik er det kort, hvis midte er tættest på
      // midten af skærmen – regnet ud fra, hvor kortene står nu, så den altid passer (også efter hop og reload).
      const updateActiveDot = () => {
        const middle = window.innerHeight / 2;
        let closest = 0;
        cards.forEach((card, index) => {
          const box = card.getBoundingClientRect();
          const best = cards[closest].getBoundingClientRect();
          if (Math.abs(box.top + box.height / 2 - middle) < Math.abs(best.top + best.height / 2 - middle)) {
            closest = index;
          }
        });
        dots.forEach((dot, index) => dot.toggleAttribute("data-active", index === closest));
      };
      ScrollTrigger.create({
        trigger: section,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => dotsRef.current?.classList.toggle(styles.dotsShown, self.isActive),
        onUpdate: updateActiveDot,
        onRefresh: updateActiveDot,
      });

      // Ryd op, når komponenten forsvinder: tallene står som før
      return () => {
        section.querySelectorAll("[data-days]").forEach((element) => {
          element.textContent = element.dataset.days;
        });
      };
    }, section);

    return () => ctx.revert();
  }, [movies]);

  return (
    <>
      <HeroScroll
        label="Velkommen"
        targetRef={firstCardRef}
        targetImage={first?.hero_url}
        targetLift={IMAGE_LIFT[first?.slug] ?? 0}
        films={films}
      >
        {first && <ComingSoonCard movie={first} copy />}
      </HeroScroll>

      <section ref={sectionRef} className={styles.cards} aria-label="Kommer snart">
        {movies.map((movie, index) => (
          <div key={movie.slug} ref={index === 0 ? firstCardRef : undefined} className={styles.card} data-featured-card>
            {/* Kort 1 hentes først. De andre hentes med det samme, så billederne ikke dukker op midt i scrollen. */}
            <ComingSoonCard
              movie={movie}
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              lift={IMAGE_LIFT[movie.slug] ?? 0}
            />
          </div>
        ))}
      </section>

      {/* Hvilket kort man er ved – kun pynt, kortene har selv overskrifter */}
      <div ref={dotsRef} className={styles.dots} aria-hidden="true">
        {movies.map((movie) => (
          <span key={movie.slug} className={styles.dot} />
        ))}
      </div>
    </>
  );
}
