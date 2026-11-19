"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroCountdown from "@/components/features/hero-animation/IntroCountdown";
import Starfield from "@/components/features/hero-animation/Starfield";
import { useLenis } from "@/components/features/SmoothScroll";
import { getParallaxBox, PARALLAX_STRENGTH } from "@/components/ui/ParallaxFrame";
import styles from "./HeroScroll.module.css";

// The posters that float past. The last one (Sunrise) unfolds into the first "Kommer snart" card.
// position: which part of the image is shown on the poster (object-position)
// The last poster has no image of its own: it shows the first card's image (targetImage) all the way,
// so the poster just stretches out into the card – never two images on top of each other.
const FILMS = [
  { src: "/intro/plakater/dune.jpg" },
  { src: "/intro/plakater/paper-tiger.jpg" },
  { src: "/intro/plakater/hexe.jpg" },
  { src: "/intro/plakater/angry-birds.jpg" },
  { src: "/intro/plakater/faderhuset.jpg" },
  { src: "/intro/plakater/you-can-see-everything.jpg" },
  { src: "/intro/plakater/markens-groede.jpg" },
  { src: "/intro/plakater/jumanji.jpg" },
  // Square image: in the standing poster only the sides are cut off, so the middle shows the tents and mountains
  { position: "50% 50%" },
];

// Fixed places in the room: [x, y (share of the screen from the middle), width in px]. Reused if there are more films.
const SLOTS = [
  [-0.34, -0.2, 250], [0.33, 0.22, 210], [0.3, -0.27, 200], [-0.31, 0.25, 250], [0.37, -0.04, 220],
  [-0.39, 0.03, 240], [0.22, 0.31, 200], [-0.22, -0.31, 210], [0.33, -0.23, 230], [-0.33, 0.21, 240],
];
const DEPTH = 6000; // How far the camera flies
const POSTER_GONE_Z = 800; // A poster has faded out here (perspective 900px: it is shown about 9× larger)
const LAST_WIDTH = 300; // The last film's width before it unfolds
const POSTER_RATIO = 1.25; // Height / width of a poster
const FULL_SIZE_WIDTH = 1200; // Posters have full size from this screen width – smaller on mobile
const MIN_POSTER_SCALE = 0.55;
const REVEAL_BLUR_PX = 10; // The card's text goes from blurred to sharp

const clamp = gsap.utils.clamp(0, 1);

// "50% 30%" → [50, 30]. object-position in percent, as getComputedStyle gives it.
function parsePosition(position = "50% 50%") {
  const [x = "50%", y = "50%"] = position.trim().split(/\s+/);
  return [parseFloat(x), parseFloat(y)];
}

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
 * Sektionen er pinned, mens det sker, og scroller man op igen, kører det hele baglæns.
 *
 * 1. Nedtællingen 3-2-1 (IntroCountdown) kører på tid ved indlæsning og ligger over alt, også headeren.
 *    Man kan ikke scrolle, mens den kører (Lenis er stoppet).
 * 2. Når den glider op, toner plakaterne frem, og "Scroll"-markøren venter nederst.
 * 3. Resten styres af scroll (GSAP ScrollTrigger med pin og scrub). Til sidst folder den sidste plakat sig ud
 *    til det første "Kommer snart"-kort (target): plakaten vokser til kortets plads og størrelse, kortets billede
 *    tones ind – præcis som kortets parallax viser det – og en kopi af kortets tekst (children) skærpes frem.
 * 4. Når hero'en slipper, byttes plakaten ud med det rigtige kort. Scroller man op, byttes der tilbage.
 *
 * Kortet ligger i sektionen lige under hero'en, trukket en skærmhøjde op (se FeaturedMovies), så det står
 * præcis, hvor hero'en var, når den slipper.
 *
 * Har man bedt om mindre bevægelse, vises hero'en ikke – kun kortene (se HeroScroll.module.css).
 *
 * @param {object} props
 * @param {React.RefObject<HTMLElement>} props.targetRef Det første kort – plakaten folder sig ud til det
 * @param {string} [props.targetImage] Billedet i det første kort
 * @param {number} [props.targetLift] Kortets lift (se ParallaxFrame), så billedet står samme sted ved byttet
 * @param {React.ReactNode} [props.children] Kopien af kortets indhold, der skærpes frem i plakaten
 * @param {{ src: string, position?: string }[]} [props.films] Plakaterne. Den sidste folder sig ud til kortet.
 * @param {number} [props.strength] Kortets parallax (se ParallaxFrame), så billedet står samme sted ved byttet
 * @param {number} [props.scrollLength] Hvor lang scrollen er, i procent af skærmhøjden
 * @param {string} [props.cueLabel] Teksten i scroll-markøren
 * @param {string} [props.label] Sektionens navn for skærmlæsere
 */
export default function HeroScroll({
  targetRef,
  targetImage,
  targetLift = 0,
  children,
  films = FILMS,
  strength = PARALLAX_STRENGTH,
  scrollLength = 360,
  cueLabel = "Scroll",
  label,
}) {
  // true/false i browseren, null på serveren
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [showCountdown, setShowCountdown] = useState(true);
  const lenis = useLenis();

  const heroRef = useRef(null);
  const cueRef = useRef(null);
  const vignetteRef = useRef(null);
  const revealLayerRef = useRef(null);
  const copyRef = useRef(null);
  const posterRefs = useRef([]);
  // The posters fade in when the countdown slides away. The tween is made in the effect below.
  const fadeTween = useRef(null);
  const fadeWanted = useRef(false);

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

  // Ingen scroll, mens nedtællingen kører: Lenis stoppes (dens CSS stopper også touch).
  // Før Lenis er startet, klares det med overflow. Bagefter måles siden igen, fordi scrollbaren kommer tilbage.
  useEffect(() => {
    if (reduceMotion !== false || !showCountdown) {
      return;
    }
    if (lenis) {
      lenis.stop();
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (lenis) {
        lenis.start();
      } else {
        document.body.style.overflow = "";
      }
      ScrollTrigger.refresh();
    };
  }, [reduceMotion, showCountdown, lenis]);

  // The scroll animation
  useEffect(() => {
    const target = targetRef?.current;
    if (reduceMotion !== false || !target) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const hero = heroRef.current;
    const vignette = vignetteRef.current;
    const revealLayer = revealLayerRef.current;
    const revealImage = revealLayer?.querySelector("img");
    // Which part of the image the poster shows, and which part the card shows. Interpolated during the unfolding.
    const posterPosition = parsePosition(films[films.length - 1].position);
    const cardImage = target.querySelector("img");
    const cardPosition = parsePosition(cardImage ? getComputedStyle(cardImage).objectPosition : undefined);
    const copy = copyRef.current;
    const posters = posterRefs.current.slice(0, films.length);
    const lastIndex = films.length - 1;
    const layout = getLayout(films);
    const startRadius = parseFloat(getComputedStyle(posters[0]).borderTopLeftRadius);
    const camera = { z: 0 };
    const morph = { m: 0 };
    // The card's text follows the scroll evenly through the unfolding (the unfolding itself eases in and out,
    // so tying the text to it made the text rush in during the middle)
    const textReveal = { v: 0 };
    const fade = { v: 0 };
    let swapped = false;

    // Where the card stands when the hero lets go. The card's section starts where the hero starts,
    // so the card's place in its section is its place on the screen.
    function getTarget() {
      return {
        x: target.offsetLeft,
        y: target.offsetTop,
        width: target.offsetWidth,
        height: target.offsetHeight,
        radius: parseFloat(getComputedStyle(target.firstElementChild ?? target).borderTopLeftRadius),
      };
    }

    // The last poster's image. At k = 1 it stands exactly as the card's parallax has it when the hero lets go.
    // At k = 0 (the poster) it "holds the card's bottom": the poster shows the same share of the image as the card,
    // ending at the same place – so the unfolding just opens up towards the sky.
    // Both the layer's height and its top edge move in a straight line, so the image always covers the frame.
    function placeImage(card, posterHeight, frameHeight, k) {
      if (!revealLayer) {
        return;
      }
      const box = getParallaxBox({
        frameHeight: card.height,
        frameTop: card.y,
        viewportHeight: window.innerHeight,
        strength,
        lift: targetLift,
      });
      const cardLayerTop = card.height / 2 - box.height / 2 + box.y; // relative to the card's top edge
      const share = card.height / box.height; // how much of the layer the card shows
      const shownBottom = (card.height - cardLayerTop) / box.height; // where the card's view ends (0–1)
      const posterLayerHeight = posterHeight / share;
      const posterLayerTop = -(shownBottom - share) * posterLayerHeight;

      const layerHeight = posterLayerHeight + (box.height - posterLayerHeight) * k;
      const layerTop = posterLayerTop + (cardLayerTop - posterLayerTop) * k;
      // The layer is centred in the frame by CSS (top: 50%, translate -50%), so it is moved from there
      revealLayer.style.height = `${layerHeight}px`;
      revealLayer.style.transform = `translate3d(0, ${layerTop - frameHeight / 2 + layerHeight / 2}px, 0)`;
      revealImage.style.objectPosition = posterPosition
        .map((value, axis) => `${value + (cardPosition[axis] - value) * k}%`)
        .join(" ");
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
          const card = getTarget();
          const k = morph.m;
          const frameWidth = w0 + (card.width - w0) * k;
          const frameHeight = h0 + (card.height - h0) * k;
          const x = -w0 / 2 + (card.x - width / 2 + w0 / 2) * k;
          const y = -h0 / 2 + (card.y - height / 2 + h0 / 2) * k;
          Object.assign(poster.style, {
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            borderRadius: `${startRadius + (card.radius - startRadius) * k}px`,
            transform: `translate3d(${x}px, ${y}px, 0)`,
            opacity: swapped ? "0" : "1",
            visibility: swapped ? "hidden" : "visible",
          });

          // One image all the way: it grows with the frame from the poster to exactly where
          // the card's parallax has it when the hero lets go (height, offset and crop)
          placeImage(card, h0, frameHeight, k);
          vignette.style.opacity = String(k);

          // The card's text stands still where it ends up: it is laid out at the card's final size and place,
          // and the growing poster opens like a window over it (no reflow, nothing sliding around).
          // The poster's top-left corner is the camera's centre (middle of the hero) + the translate above.
          Object.assign(copy.style, {
            width: `${card.width}px`,
            height: `${card.height}px`,
            transform: `translate3d(${card.x - (width / 2 + x)}px, ${card.y - (height / 2 + y)}px, 0)`,
          });
          // It fades in and sharpens over most of the unfolding, starting and ending softly
          const t = clamp((textReveal.v - 0.2) / 0.75);
          const text = t * t * (3 - 2 * t);
          copy.style.opacity = String(text);
          copy.style.filter = text < 1 ? `blur(${(1 - text) * REVEAL_BLUR_PX}px)` : "none";
          return;
        }

        Object.assign(poster.style, { width: `${w0}px`, height: `${h0}px` });
        if (isLast) {
          poster.style.borderRadius = "";
          placeImage(getTarget(), h0, h0, 0);
          vignette.style.opacity = "0";
          copy.style.opacity = "0";
        }
        // Hidden from where it has faded out (see fadeOut), before it gets very large close to the camera
        if (z >= POSTER_GONE_Z) {
          poster.style.visibility = "hidden";
          return;
        }
        const fadeIn = clamp(isLast ? (z + 4000) / 1500 : (z + 5600) / 2400);
        const fadeOut = isLast ? 1 : clamp((POSTER_GONE_Z - z) / 400);
        poster.style.visibility = "visible";
        poster.style.opacity = String(Math.min(fadeIn, fadeOut) * fade.v * Math.min(1, 0.6 + camera.z / 1400));
        poster.style.transform = `translate3d(${place.x * width - w0 / 2}px, ${place.y * height - h0 / 2}px, ${z}px)`;
      });
    }

    // Swap the unfolded poster for the real card – they look the same, so it can't be seen
    function swap(toCard) {
      swapped = toCard;
      gsap.set(target, { autoAlpha: toCard ? 1 : 0 });
      render();
    }

    const ctx = gsap.context(() => {
      gsap.set(target, { autoAlpha: 0 });
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
            invalidateOnRefresh: true,
            // Measured before the cards below, which are pushed down by the pin
            refreshPriority: 1,
            // The card is shown from the very end of the pin – also when scroll stops exactly there (fx a snap),
            // so the poster and the card never stand on top of each other
            onUpdate: (self) => {
              const atEnd = self.progress >= 0.9999;
              if (atEnd !== swapped) {
                swap(atEnd);
              }
            },
            onLeave: () => swap(true),
          },
        })
        .to(camera, { z: DEPTH, duration: 1, ease: "none", onUpdate: render }, 0)
        .to(cueRef.current, { opacity: 0, duration: 0.05, ease: "none" }, 0)
        .to(morph, { m: 1, duration: 0.32, ease: "power2.inOut", onUpdate: render }, 1)
        .to(textReveal, { v: 1, duration: 0.32, ease: "none", onUpdate: render }, 1)
        .to({}, { duration: 0.02 }); // A short pause where the card stands finished before the section lets go

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      // Opened further down the page (e.g. after a reload): the card is already there
      if (timeline.scrollTrigger.progress >= 1) {
        swap(true);
      }

      return () => hero.removeEventListener("pointermove", onPointerMove);
    }, hero);

    // Place the posters again when ScrollTrigger has measured the page (after resize the pinned hero gets its new
    // size from ScrollTrigger a moment later – a plain resize listener would use the old size)
    ScrollTrigger.addEventListener("refresh", render);

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
      ScrollTrigger.removeEventListener("refresh", render);
      window.removeEventListener("load", refresh);
      fadeTween.current = null;
      ctx.revert();
    };
  }, [reduceMotion, films, scrollLength, strength, targetRef, targetLift]);

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
            {films.map((film, index) => {
              const isLast = index === films.length - 1;
              return (
                <div
                  key={index}
                  ref={(element) => {
                    posterRefs.current[index] = element;
                  }}
                  className={styles.poster}
                >
                  {/* Den sidste plakat viser kortets billede hele vejen (samme billede og sizes som kortets
                      ParallaxFrame, så browseren henter præcis samme fil) og har kortets toning og tekst klar */}
                  {isLast && targetImage ? (
                    <div ref={revealLayerRef} className={styles.revealLayer}>
                      <Image
                        src={targetImage}
                        alt=""
                        fill
                        sizes="100vw"
                        loading="eager"
                        className={styles.revealImage}
                        style={{ objectPosition: film.position }}
                        draggable={false}
                      />
                    </div>
                  ) : (
                    film.src && (
                      <img
                        className={styles.posterImage}
                        src={film.src}
                        alt=""
                        draggable={false}
                        style={{ objectPosition: film.position }}
                      />
                    )
                  )}
                  {isLast && <div ref={vignetteRef} className={styles.vignette} />}
                  {isLast && (
                    <div ref={copyRef} className={styles.copy}>
                      {children}
                    </div>
                  )}
                </div>
              );
            })}
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
