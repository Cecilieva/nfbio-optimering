"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroCountdown from "@/components/features/homepage-animations/IntroCountdown";
import Starfield from "@/components/features/homepage-animations/Starfield";
import { useLenis } from "@/components/features/layout/SmoothScroll";
import { getParallaxBox, PARALLAX_STRENGTH } from "@/components/ui/ParallaxFrame";
import { prefersReducedMotion, subscribeReducedMotion } from "@/lib/motion";
import styles from "./HeroScroll.module.css";

// Plakaterne, der svæver forbi, kommer fra FeaturedMovies (tilfældige plakater fra Supabase).
// position: hvilken del af billedet plakaten viser (object-position i CSS).
// Den sidste plakat har ikke sit eget billede: den viser kort 1's hero-billede (targetImage) hele vejen,
// så plakaten bare strækker sig ud til kortet – der er aldrig to billeder oven på hinanden.
// Uden films vises kun den sidste plakat.
const FILMS = [{ position: "50% 50%" }];

// Faste pladser i rummet: [x, y (andel af skærmen ud fra midten), bredde i px]. Genbruges, hvis der er flere film.
const SLOTS = [
  [-0.34, -0.2, 250], [0.33, 0.22, 210], [0.3, -0.27, 200], [-0.31, 0.25, 250], [0.37, -0.04, 220],
  [-0.39, 0.03, 240], [0.22, 0.31, 200], [-0.22, -0.31, 210], [0.33, -0.23, 230], [-0.33, 0.21, 240],
];
const DEPTH = 6000; // Hvor langt "kameraet" flyver ind i rummet
const POSTER_GONE_Z = 800; // Her er en plakat tonet helt ud (den vises ca. 9 gange større, fordi den er tæt på)
const LAST_WIDTH = 300; // Den sidste plakats bredde, før den folder sig ud
const POSTER_RATIO = 1.25; // Højde / bredde på en plakat
const FULL_SIZE_WIDTH = 1200; // Plakaterne har fuld størrelse fra denne skærmbredde – mindre på mobil
const MIN_POSTER_SCALE = 0.55; // Mindste størrelse på mobil
const COPY_CLICKABLE_FROM = 0.8; // Kortets knapper kan trykkes på, når teksten er så langt fremme (0–1)
const REVEAL_BLUR_PX = 10; // Kortets tekst går fra så sløret til skarp

// Holder et tal mellem 0 og 1
const clamp = gsap.utils.clamp(0, 1);

// "50% 30%" → [50, 30]. Laver object-position om til tal (i procent), så de kan blandes.
function parsePosition(position = "50% 50%") {
  const [x = "50%", y = "50%"] = position.trim().split(/\s+/);
  return [parseFloat(x), parseFloat(y)];
}

// Er animationerne slået fra? (lib/motion.js) Læst med useSyncExternalStore.
// Serveren kan ikke se indstillingen, så dér er svaret null ("ved ikke endnu").
function getServerReducedMotion() {
  return null;
}

// Har nedtællingen kørt, siden siden blev indlæst? Den skal kun vises, når siden faktisk indlæses –
// kommer man tilbage til forsiden fra filmsiden via et link, springes den over.
// Værdien ligger i browserens hukommelse og nulstilles ved en genindlæsning, så vises nedtællingen igen.
// (På serveren er den altid false, ligesom i browseren ved en ny indlæsning – derfor matcher de to.)
let introPlayed = false;

// Hver film får en plads og en dybde (z). Den sidste står altid i midten, længst væk.
// De andre fordeles jævnt i dybden, så de kommer forbi én ad gangen.
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
 *    Den kører kun én gang pr. indlæsning af siden – kommer man tilbage til forsiden via et link, springes den over.
 *    Man kan ikke scrolle, mens den kører (Lenis er stoppet).
 * 2. Når den glider op, toner plakaterne frem, og "Scroll"-markøren venter nederst.
 * 3. Resten styres af scroll. "Pinned" betyder, at hero'en står fast på skærmen, mens man scroller, og
 *    "scrub", at animationen følger scrollen frem og tilbage. Kameraet flyver ind gennem plakaterne, og
 *    til sidst folder den sidste plakat sig ud til det første "Kommer snart"-kort (target): plakaten vokser
 *    til kortets plads og størrelse, og en kopi af kortets tekst (children) skærpes frem.
 * 4. Når hero'en slipper, byttes plakaten ud med det rigtige kort. De ser ens ud, så man kan ikke se byttet.
 *    Scroller man op, byttes der tilbage.
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
 * @param {boolean} [props.skipIntro] true: nedtællingen 3-2-1 springes over (fx når man kommer fra billetten)
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
  skipIntro = false,
}) {
  // true/false i browseren, null på serveren
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, getServerReducedMotion);
  // Nedtællingen vises, hvis den ikke allerede har kørt siden siden blev indlæst, og ikke skal springes over
  const [showCountdown, setShowCountdown] = useState(() => !introPlayed && !skipIntro);
  const lenis = useLenis();
  // Lenis til klik på kortets knapper under udfoldningen. En ref, så scroll-animationen ikke starter forfra,
  // når Lenis er klar.
  const lenisRef = useRef(null);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const heroRef = useRef(null);
  const cueRef = useRef(null);
  const vignetteRef = useRef(null);
  const revealLayerRef = useRef(null);
  const copyRef = useRef(null);
  const posterRefs = useRef([]);
  // Plakaterne toner frem, når nedtællingen glider væk. Selve animationen laves længere nede.
  // fadeWanted husker, hvis nedtællingen var hurtigere end animationen – og er sand fra start,
  // når nedtællingen springes over, så plakaterne toner frem med det samme.
  const fadeTween = useRef(null);
  const fadeWanted = useRef(!showCountdown);

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

  // Selve scroll-animationen
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
    // Hvilken del af billedet plakaten viser, og hvilken del kortet viser. Under udfoldningen glider den fra den ene
    // til den anden.
    const posterPosition = parsePosition(films[films.length - 1].position);
    const cardImage = target.querySelector("img");
    const cardPosition = parsePosition(cardImage ? getComputedStyle(cardImage).objectPosition : undefined);
    const copy = copyRef.current;
    const posters = posterRefs.current.slice(0, films.length);
    const lastIndex = films.length - 1;
    const layout = getLayout(films);
    const startRadius = parseFloat(getComputedStyle(posters[0]).borderTopLeftRadius);
    // Tallene, som scroll-animationen ændrer, og som render() tegner ud fra:
    const camera = { z: 0 }; // Hvor langt kameraet er fløjet ind i rummet
    const morph = { m: 0 }; // Udfoldningen af den sidste plakat: 0 = plakat, 1 = kort
    // Kortets tekst: følger scrollen jævnt. Udfoldningen går langsomt i gang og i stå, og hvis teksten fulgte den,
    // ville den fare frem på midten.
    const textReveal = { v: 0 };
    const fade = { v: 0 }; // Plakaterne toner frem efter nedtællingen
    let swapped = false; // Er plakaten byttet ud med det rigtige kort?

    // Hvor kort 1 står, når hero'en slipper. Kortenes sektion starter samme sted som hero'en,
    // så kortets plads i sektionen er også dets plads på skærmen.
    function getTarget() {
      return {
        x: target.offsetLeft,
        y: target.offsetTop,
        width: target.offsetWidth,
        height: target.offsetHeight,
        radius: parseFloat(getComputedStyle(target.firstElementChild ?? target).borderTopLeftRadius),
      };
    }

    // Placerer billedet i den sidste plakat. k er udfoldningen: 0 = plakat, 1 = kort.
    // Ved k = 1 står billedet præcis, som kortets parallax har det, når hero'en slipper – så byttet ikke ses.
    // Ved k = 0 "holder plakaten kortets bund": den viser samme bund af billedet som kortet, så udfoldningen
    // bare åbner op mod himlen. Imellem glider højde og placering jævnt fra det ene til det andet, så billedet
    // altid dækker hele plakaten.
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
      // Billedlagets top i kortet, målt fra kortets top (negativ = over kortet)
      const cardLayerTop = card.height / 2 - box.height / 2 + box.y;
      // Hvor stor en del af billedet kortet viser, og hvor i billedet kortets bund er (0 = top, 1 = bund)
      const share = card.height / box.height;
      const shownBottom = (card.height - cardLayerTop) / box.height;
      // Plakaten viser samme andel af billedet og slutter samme sted forneden
      const posterLayerHeight = posterHeight / share;
      const posterLayerTop = -(shownBottom - share) * posterLayerHeight;

      // Bland plakatens og kortets værdier efter k
      const layerHeight = posterLayerHeight + (box.height - posterLayerHeight) * k;
      const layerTop = posterLayerTop + (cardLayerTop - posterLayerTop) * k;
      // Laget er centreret i plakaten af CSS'en (top: 50% og translate -50%), så det flyttes ud fra midten
      revealLayer.style.height = `${layerHeight}px`;
      revealLayer.style.transform = `translate3d(0, ${layerTop - frameHeight / 2 + layerHeight / 2}px, 0)`;
      revealImage.style.objectPosition = posterPosition
        .map((value, axis) => `${value + (cardPosition[axis] - value) * k}%`)
        .join(" ");
    }

    // Tegner alle plakaterne ud fra, hvor kameraet er. Kaldes, hver gang scrollen ændrer noget.
    // Plakaterne står i et 3D-rum (CSS perspective), og z er afstanden til kameraet.
    function render() {
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      // Plakaterne er mindre på små skærme
      const scale = Math.max(MIN_POSTER_SCALE, Math.min(1, width / FULL_SIZE_WIDTH));

      posters.forEach((poster, index) => {
        const place = layout[index];
        const isLast = index === lastIndex;
        const w0 = place.width * scale;
        const h0 = w0 * POSTER_RATIO;
        const z = place.z + camera.z; // Afstanden til kameraet: jo større, jo tættere på

        if (isLast && morph.m > 0) {
          // Sidste trin: den sidste plakat vokser fladt ud til kortets størrelse og plads.
          // Alle tal glider fra plakatens værdi (k = 0) til kortets værdi (k = 1).
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

          // Ét billede hele vejen, der vokser med plakaten, og kortets mørke toning tones ind
          placeImage(card, h0, frameHeight, k);
          vignette.style.opacity = String(k);

          // Kopien af kortets tekst står stille det sted, hvor den ender: den har hele tiden kortets størrelse
          // og plads, og plakaten åbner sig som et vindue hen over den. Så flytter teksten sig ikke undervejs.
          // Plakatens øverste venstre hjørne er midten af hero'en + flytningen ovenfor, så teksten flyttes
          // tilbage med forskellen.
          Object.assign(copy.style, {
            width: `${card.width}px`,
            height: `${card.height}px`,
            transform: `translate3d(${card.x - (width / 2 + x)}px, ${card.y - (height / 2 + y)}px, 0)`,
          });
          // Teksten tones ind og bliver skarp over det meste af udfoldningen. t * t * (3 - 2t) får den til
          // at gå blødt i gang og blødt i stå.
          const t = clamp((textReveal.v - 0.2) / 0.75);
          const text = t * t * (3 - 2 * t);
          copy.style.opacity = String(text);
          copy.style.filter = text < 1 ? `blur(${(1 - text) * REVEAL_BLUR_PX}px)` : "none";
          // Når teksten næsten er skarp, kan man trykke på knapperne (se onCopyClick)
          copy.style.pointerEvents = text >= COPY_CLICKABLE_FROM ? "auto" : "none";
          return;
        }

        Object.assign(poster.style, { width: `${w0}px`, height: `${h0}px` });
        if (isLast) {
          poster.style.borderRadius = "";
          placeImage(getTarget(), h0, h0, 0);
          vignette.style.opacity = "0";
          copy.style.opacity = "0";
          copy.style.pointerEvents = "none";
        }
        // Skjul plakaten, når den er tonet ud. Kommer den helt tæt på kameraet, bliver den meget stor, og så
        // kan browseren ikke tegne den ordentligt (den kunne blive skåret over).
        if (z >= POSTER_GONE_Z) {
          poster.style.visibility = "hidden";
          return;
        }
        // Plakaterne toner ind langt væk og ud, lige før de når kameraet. I starten er de lidt dæmpede.
        const fadeIn = clamp(isLast ? (z + 4000) / 1500 : (z + 5600) / 2400);
        const fadeOut = isLast ? 1 : clamp((POSTER_GONE_Z - z) / 400);
        poster.style.visibility = "visible";
        poster.style.opacity = String(Math.min(fadeIn, fadeOut) * fade.v * Math.min(1, 0.6 + camera.z / 1400));
        poster.style.transform = `translate3d(${place.x * width - w0 / 2}px, ${place.y * height - h0 / 2}px, ${z}px)`;
      });
    }

    // Byt den udfoldede plakat ud med det rigtige kort (eller tilbage). De ser ens ud, så man kan ikke se det.
    // autoAlpha: GSAP sætter både opacity og visibility.
    function swap(toCard) {
      swapped = toCard;
      gsap.set(target, { autoAlpha: toCard ? 1 : 0 });
      render();
    }

    const ctx = gsap.context(() => {
      gsap.set(target, { autoAlpha: 0 });
      render();

      // Plakaterne toner blødt frem, når nedtællingen glider væk (startes fra handleCountdownSlideStart)
      fadeTween.current = gsap.to(fade, { v: 1, duration: 1.6, ease: "power2.out", onUpdate: render, paused: true });
      if (fadeWanted.current) {
        fadeTween.current.play();
      }

      // Musen drejer "kameraet" en lille smule: perspektivets midtpunkt følger musen blødt
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

      // Scroll-tidslinjen. Hero'en står fast (pin) i scrollLength % af skærmhøjden, mens:
      // 0 → 1: kameraet flyver frem, og scroll-markøren forsvinder med det samme
      // 1 → 1,32: den sidste plakat folder sig ud til kortet, og kortets tekst kommer frem
      // til sidst en lille pause, hvor kortet står færdigt, før hero'en slipper
      const timeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: `+=${scrollLength}%`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
            // Måles før kortene nedenunder, fordi pin'en skubber dem ned
            refreshPriority: 1,
            // Kortet vises helt fra slutningen af pin'en – også hvis scrollen stopper præcis på kanten –
            // så plakaten og kortet aldrig står oven på hinanden
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
        .to({}, { duration: 0.02 }); // Den lille pause

      // Sorter ScrollTriggers efter refreshPriority, så pin'en måles først, og mål siden igen
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      // Åbnes siden længere nede (fx efter en genindlæsning), skal kortet allerede stå der
      if (timeline.scrollTrigger.progress >= 1) {
        swap(true);
      }

      // Knapperne i kopien kan ikke trykkes på (den er inert), men kopien står præcis som kortet. Et klik på en
      // knap i kopien scroller derfor hero'en færdig, så det rigtige kort står fremme, og trykker så på den
      // samme knap i kortet. Så kan man ramme knapperne lidt før, kortet har fuld størrelse.
      const controlAt = (event) =>
        [...copy.querySelectorAll("a, button")].findIndex((control) => {
          const box = control.getBoundingClientRect();
          return (
            event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom
          );
        });
      const onCopyMove = (event) => {
        copy.style.cursor = controlAt(event) >= 0 ? "pointer" : "";
      };
      const onCopyClick = (event) => {
        const index = controlAt(event);
        const control = target.querySelectorAll("a, button")[index];
        if (index < 0 || !control) {
          return;
        }
        const end = timeline.scrollTrigger.end;
        const finish = () => {
          swap(true);
          control.click();
        };
        if (lenisRef.current) {
          lenisRef.current.scrollTo(end, { duration: 0.5, onComplete: finish });
        } else {
          window.scrollTo(0, end);
          finish();
        }
      };
      copy.addEventListener("pointermove", onCopyMove);
      copy.addEventListener("click", onCopyClick);

      return () => {
        hero.removeEventListener("pointermove", onPointerMove);
        copy.removeEventListener("pointermove", onCopyMove);
        copy.removeEventListener("click", onCopyClick);
      };
    }, hero);

    // Tegn plakaterne igen, når ScrollTrigger har målt siden. Ændres vinduets størrelse, får hero'en først sin
    // nye størrelse lidt efter, så plakaterne skal tegnes efter målingen og ikke med det samme.
    ScrollTrigger.addEventListener("refresh", render);

    // Pin'en ændrer sidens højde, så siden måles igen, når billeder og skrifttyper er indlæst
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

    // Ryd op, når komponenten forsvinder
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

  // Nedtællingen er gledet ud: fjern den, og husk at den har kørt (til siden indlæses igen)
  function handleCountdownDone() {
    introPlayed = true;
    setShowCountdown(false);
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
          <IntroCountdown onSlideStart={handleCountdownSlideStart} onDone={handleCountdownDone} />
        </div>
      )}
    </>
  );
}
