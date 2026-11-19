"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroCountdown from "@/components/features/hero-animation/IntroCountdown";
import Starfield from "@/components/features/hero-animation/Starfield";
import styles from "./HeroScroll.module.css";

// The posters that float past. The last one (Sunrise) becomes the "Kommer snart" card.
// position: which part of the image is shown on the poster (object-position)
const FILMS = [
  { src: "/intro/plakater/dune.jpg" },
  { src: "/intro/plakater/paper-tiger.jpg" },
  { src: "/intro/plakater/hexe.jpg" },
  { src: "/intro/plakater/angry-birds.jpg" },
  { src: "/intro/plakater/faderhuset.jpg" },
  { src: "/intro/plakater/you-can-see-everything.jpg" },
  { src: "/intro/plakater/markens-groede.jpg" },
  { src: "/intro/plakater/jumanji.jpg" },
  { src: "/intro/plakater/sunrise.jpg", position: "50% 100%" },
];

// Fixed places in the room: [x, y (share of the screen from the middle), width in px]. Reused if there are more films.
const SLOTS = [
  [-0.34, -0.2, 250], [0.33, 0.22, 210], [0.3, -0.27, 200], [-0.31, 0.25, 250], [0.37, -0.04, 220],
  [-0.39, 0.03, 240], [0.22, 0.31, 200], [-0.22, -0.31, 210], [0.33, -0.23, 230], [-0.33, 0.21, 240],
];
const DEPTH = 6000; // How far the camera flies
const LAST_WIDTH = 300; // The last film's width before it unfolds
const POSTER_RATIO = 1.25; // Height / width of a poster
const FULL_SIZE_WIDTH = 1200; // Posters have full size from this screen width – smaller on mobile
const MIN_POSTER_SCALE = 0.55;
const REVEAL_BLUR_PX = 14; // The card's content goes from blurred to sharp

const clamp = gsap.utils.clamp(0, 1);

// Brugerens indstilling for "mindre bevægelse", læst med useSyncExternalStore.
// Serveren kan ikke se indstillingen, så dér er svaret null ("ved ikke endnu").
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

function getServerReducedMotion() {
  return null;
}

// Each film gets a place and a depth. The last one is always in the middle, furthest away.
function getLayout(films) {
  return films.map((film, index) => {
    if (index === films.length - 1) {
      return { x: 0, y: 0, z: -DEPTH, width: LAST_WIDTH };
    }
    const [x, y, width] = SLOTS[index % SLOTS.length];
    const z = -700 - (index / Math.max(1, films.length - 2)) * (DEPTH - 1600);
    return { x, y, z, width };
  });
}

/**
 * Hero'en øverst på forsiden: filmplakater svæver i et stjernerum og kommer imod en, når man scroller.
 * Til sidst folder den sidste film (Sunrise) sig ud til "Kommer snart"-kortet (children), som skærpes frem.
 * Sektionen er pinned, mens det sker, og scroller man op igen, kører det hele baglæns.
 *
 * 1. Nedtællingen 3-2-1 (IntroCountdown) kører på tid ved indlæsning og ligger over alt, også headeren.
 *    Man kan ikke scrolle, mens den kører.
 * 2. Når den glider op, toner plakaterne frem, og "Scroll"-markøren venter nederst.
 * 3. Resten styres af scroll (GSAP ScrollTrigger med pin og scrub).
 *
 * Har man bedt om mindre bevægelse, vises kun kortet på et stillestående stjernefelt – uden nedtælling og pin.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Kortet, der står til sidst (karrusellen)
 * @param {{ src: string, position?: string }[]} [props.films] Plakaterne. Den sidste bliver til kortet.
 * @param {number} [props.scrollLength] Hvor lang scrollen er, i procent af skærmhøjden
 * @param {string} [props.cueLabel] Teksten i scroll-markøren
 * @param {string} [props.label] Sektionens navn for skærmlæsere
 * @param {() => void} [props.onReveal] Kaldes første gang kortet står helt fremme
 */
export default function HeroScroll({ children, films = FILMS, scrollLength = 360, cueLabel = "Scroll", label, onReveal }) {
  // true/false i browseren, null på serveren
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [showCountdown, setShowCountdown] = useState(true);

  const heroRef = useRef(null);
  const cardRef = useRef(null);
  const cueRef = useRef(null);
  const vignetteRef = useRef(null);
  const posterRefs = useRef([]);
  // The posters fade in when the countdown slides away. The tween is made in the effect below.
  const fadeTween = useRef(null);
  const fadeWanted = useRef(false);
  // A ref, so the big effect doesn't run again when the parent gives a new function
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  // Mindre bevægelse: kortet står fremme med det samme
  useEffect(() => {
    if (reduceMotion === true) {
      onRevealRef.current?.();
    }
  }, [reduceMotion]);

  // Headeren ligger gennemsigtig oven på stjernerne (se Header.module.css)
  useEffect(() => {
    if (reduceMotion !== false) {
      return;
    }
    document.documentElement.dataset.intro = "";
    return () => {
      delete document.documentElement.dataset.intro;
    };
  }, [reduceMotion]);

  // Ingen scroll, mens nedtællingen kører. Bagefter måles siden igen, fordi scrollbaren kommer tilbage.
  useEffect(() => {
    if (reduceMotion !== false || !showCountdown) {
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      ScrollTrigger.refresh();
    };
  }, [reduceMotion, showCountdown]);

  // The scroll animation
  useEffect(() => {
    if (reduceMotion !== false) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const hero = heroRef.current;
    const card = cardRef.current;
    const vignette = vignetteRef.current;
    const posters = posterRefs.current.slice(0, films.length);
    const lastIndex = films.length - 1;
    const layout = getLayout(films);
    const startRadius = parseFloat(getComputedStyle(posters[0]).borderTopLeftRadius);
    const camera = { z: 0 };
    const morph = { m: 0 };
    const fade = { v: 0 };
    let revealed = false; // The card has been fully shown at least once
    let cardAmount = 0; // How much the card is shown right now
    let trigger = null;

    // Where the card ends up: the card's own place in the layout
    function getTarget() {
      const cardBox = card.getBoundingClientRect();
      const heroBox = hero.getBoundingClientRect();
      return {
        x: cardBox.left - heroBox.left,
        y: cardBox.top - heroBox.top,
        width: cardBox.width,
        height: cardBox.height,
        radius: parseFloat(getComputedStyle(card).borderTopLeftRadius),
      };
    }

    // The card's content goes from blurred to sharp in the second half of the unfolding
    function showCard(amount) {
      cardAmount = amount;
      card.style.opacity = String(amount);
      card.style.filter = amount < 1 ? `blur(${(1 - amount) * REVEAL_BLUR_PX}px)` : "none";
      card.style.pointerEvents = amount > 0.9 ? "auto" : "none";
      if (amount >= 1 && !revealed) {
        revealed = true;
        onRevealRef.current?.();
      }
    }

    // Places each film in 3D from the camera's position
    function render() {
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      const scale = Math.max(MIN_POSTER_SCALE, Math.min(1, width / FULL_SIZE_WIDTH));

      posters.forEach((poster, index) => {
        const place = layout[index];
        const isLast = index === lastIndex;
        const w0 = place.width * scale;
        const h0 = w0 * POSTER_RATIO;
        const z = place.z + camera.z;

        if (isLast && morph.m > 0) {
          // Last step: the film grows flat out to the card's size and place
          const target = getTarget();
          const k = morph.m;
          const x = -w0 / 2 + (target.x - width / 2 + w0 / 2) * k;
          const y = -h0 / 2 + (target.y - height / 2 + h0 / 2) * k;
          Object.assign(poster.style, {
            width: `${w0 + (target.width - w0) * k}px`,
            height: `${h0 + (target.height - h0) * k}px`,
            borderRadius: `${startRadius + (target.radius - startRadius) * k}px`,
            transform: `translate3d(${x}px, ${y}px, 0)`,
            opacity: "1",
            visibility: "visible",
          });
          vignette.style.opacity = String(k);
          showCard(clamp((k - 0.45) / 0.45));
          return;
        }

        Object.assign(poster.style, { width: `${w0}px`, height: `${h0}px` });
        if (isLast) {
          poster.style.borderRadius = "";
          vignette.style.opacity = "0";
          showCard(0);
        }
        if (z > 850) {
          poster.style.visibility = "hidden";
          return;
        }
        const fadeIn = clamp(isLast ? (z + 4000) / 1500 : (z + 5600) / 2400);
        const fadeOut = isLast ? 1 : clamp((800 - z) / 400);
        poster.style.visibility = "visible";
        poster.style.opacity = String(Math.min(fadeIn, fadeOut) * fade.v * Math.min(1, 0.6 + camera.z / 1400));
        poster.style.transform = `translate3d(${place.x * width - w0 / 2}px, ${place.y * height - h0 / 2}px, ${z}px)`;
      });
    }

    const ctx = gsap.context(() => {
      render();

      // The films fade in softly when the countdown slides away
      fadeTween.current = gsap.to(fade, { v: 1, duration: 1.6, ease: "power2.out", onUpdate: render, paused: true });
      if (fadeWanted.current) {
        fadeTween.current.play();
      }

      // The mouse turns the "camera" slightly (the perspective's origin)
      const origin = { x: 50, y: 50 };
      const setOrigin = () => {
        hero.style.setProperty("--hero-origin-x", `${origin.x}%`);
        hero.style.setProperty("--hero-origin-y", `${origin.y}%`);
      };
      const moveX = gsap.quickTo(origin, "x", { duration: 1.2, ease: "power3", onUpdate: setOrigin });
      const moveY = gsap.quickTo(origin, "y", { duration: 1.2, ease: "power3", onUpdate: setOrigin });
      const onPointerMove = (event) => {
        moveX(50 - (event.clientX / window.innerWidth - 0.5) * 14);
        moveY(50 - (event.clientY / window.innerHeight - 0.5) * 14);
      };
      hero.addEventListener("pointermove", onPointerMove);

      // Scroll: the camera flies forward, and in the end the last film unfolds into the card
      const timeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: `+=${scrollLength}%`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .to(camera, { z: DEPTH, duration: 1, ease: "none", onUpdate: render }, 0)
        .to(cueRef.current, { opacity: 0, duration: 0.05, ease: "none" }, 0)
        .to(morph, { m: 1, duration: 0.32, ease: "power2.inOut", onUpdate: render }, 1)
        .to({}, { duration: 0.08 }); // A short pause where the card stands finished before the section lets go
      trigger = timeline.scrollTrigger;

      return () => hero.removeEventListener("pointermove", onPointerMove);
    }, hero);

    // With the keyboard: tabbing into the card before it is shown scrolls to the end of the hero
    function onFocusIn() {
      if (cardAmount < 1 && trigger) {
        window.scrollTo({ top: trigger.end });
      }
    }
    card.addEventListener("focusin", onFocusIn);

    window.addEventListener("resize", render);

    // The pin changes the page's height, so measure again when images and fonts are loaded
    let active = true;
    const refresh = () => {
      if (active) {
        ScrollTrigger.refresh();
      }
    };
    document.fonts?.ready.then(refresh);
    if (document.readyState !== "complete") {
      window.addEventListener("load", refresh, { once: true });
    }

    return () => {
      active = false;
      card.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", render);
      window.removeEventListener("load", refresh);
      fadeTween.current = null;
      ctx.revert();
      card.style.cssText = "";
    };
  }, [reduceMotion, films, scrollLength]);

  function handleCountdownSlideStart() {
    fadeWanted.current = true;
    fadeTween.current?.play();
  }

  return (
    <>
      <section ref={heroRef} className={styles.hero} aria-label={label}>
        <Starfield />

        <div className={styles.space} aria-hidden="true">
          <div className={styles.camera}>
            {films.map((film, index) => (
              <div
                key={index}
                ref={(element) => {
                  posterRefs.current[index] = element;
                }}
                className={styles.poster}
              >
                <img
                  className={styles.posterImage}
                  src={film.src}
                  alt=""
                  draggable={false}
                  style={{ objectPosition: film.position }}
                />
                {index === films.length - 1 && <div ref={vignetteRef} className={styles.vignette} />}
              </div>
            ))}
          </div>
        </div>

        {/* Kortet ligger uden for 3D-rummet, så det kan klikkes og læses af skærmlæsere */}
        <div className={styles.content}>
          <div ref={cardRef} className={styles.card}>
            {children}
          </div>
        </div>

        {/* Scroll-markøren: forsvinder, så snart man begynder at scrolle */}
        <div ref={cueRef} className={styles.cue} aria-hidden="true">
          <span>{cueLabel}</span>
          <span className={styles.cueTrack}>
            <span className={styles.cueLine} />
          </span>
        </div>
      </section>

      {/* Nedtællingen – over alt, også headeren. Den glider selv op og ud og fjernes så.
          Før vi ved, om man har bedt om mindre bevægelse, står den stille ("pending"). */}
      {showCountdown && reduceMotion !== true && (
        <div className={styles.countdownLayer} data-status={reduceMotion === null ? "pending" : "playing"} aria-hidden="true">
          <IntroCountdown onSlideStart={handleCountdownSlideStart} onDone={() => setShowCountdown(false)} />
        </div>
      )}
    </>
  );
}
