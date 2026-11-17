"use client";

import { useEffect, useRef, useState } from "react";
import IntroCountdown from "@/components/features/IntroCountdown";
import {
  CARD_TRACKS,
  FRAME_HEIGHT,
  FRAME_WIDTH,
  INTRO_DURATION_S,
  POSTERS,
  SCROLL_POSITION,
  SCROLL_TRACKS,
  SKY_TRACKS,
  STARS,
  STARS_TRACKS,
  TWINKLES,
  playTracks,
} from "@/components/features/introTimeline";
import styles from "./IntroAnimation.module.css";

/**
 * Introen på forsiden, bygget i kode. Figma: "Forside – intro (motion)" (node 1869:14851).
 * Vises i fuld skærm, hver gang man kommer ind på siden.
 *
 * 1. Nedtællingen 3-2-1 (IntroCountdown) – ligger øverst, også over headeren.
 * 2. Stjernerummet med 11 plakater, der dukker op og flyver ud mod kanterne. Det ligger under headeren,
 *    som i Figma, så logo og ikoner kan ses hele tiden.
 * 3. Sunrise-plakaten flyver lige mod en og bliver til det rigtige "Kommer snart"-kort på siden
 *    (revealRef), mens stjernerne toner ud. Så er introen slut – der er intet hop fra animation til side.
 *
 * Alle tider og positioner står i introTimeline.js. Klik hvor som helst for at springe over.
 *
 * @param {object} props
 * @param {React.RefObject<HTMLElement>} [props.revealRef] Kortet på siden, der vokser frem til sidst
 * @param {() => void} [props.onDone] Kaldes, når introen er væk (eller blev sprunget over)
 */
export default function IntroAnimation({ revealRef, onDone }) {
  // "pending": vi ved endnu ikke, om introen skal vises (serveren kan ikke se brugerens indstillinger)
  // "playing": introen kører
  // "leaving": man har sprunget over, og introen toner ud
  // "done": introen er væk
  const [status, setStatus] = useState("pending");
  const [showCountdown, setShowCountdown] = useState(true);

  const stageRef = useRef(null);
  const skyRef = useRef(null);
  const starsRef = useRef(null);
  const scrollRef = useRef(null);
  const posterRefs = useRef([]);
  // Kortets animation gemmes for sig, så den kan stoppes, hvis man springer over
  const cardAnimations = useRef([]);

  // Har man bedt om mindre bevægelse i styresystemet, springer vi introen over
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStatus(reduceMotion ? "done" : "playing");
  }, []);

  // Sig til forælderen, når introen er væk – fx så karrusellen først begynder at skifte nu
  useEffect(() => {
    if (status === "done") {
      onDone?.();
    }
  }, [status, onDone]);

  // Mens introen kører: ingen scroll, og headeren lægges over stjernerne (se Header.module.css)
  useEffect(() => {
    if (status === "done") {
      return;
    }
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.intro = "";
    return () => {
      document.body.style.overflow = "";
      delete document.documentElement.dataset.intro;
    };
  }, [status]);

  // Figmas ramme er 1440 × 1024. Den skaleres, så den fylder skærmen (som "cover" på et billede).
  useEffect(() => {
    function fit() {
      const scale = Math.max(window.innerWidth / FRAME_WIDTH, window.innerHeight / FRAME_HEIGHT);
      stageRef.current?.style.setProperty("--intro-scale", String(scale));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Start hele tidslinjen på én gang, når vi ved, at introen skal vises
  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    const animations = [
      ...playTracks(skyRef.current, SKY_TRACKS),
      ...playTracks(starsRef.current, STARS_TRACKS),
      ...playTracks(scrollRef.current, SCROLL_TRACKS),
      ...POSTERS.flatMap((poster, index) => playTracks(posterRefs.current[index], poster.tracks)),
    ];
    if (revealRef?.current) {
      cardAnimations.current = playTracks(revealRef.current, CARD_TRACKS);
    }

    // Når tidslinjen er færdig, er stjernerne væk, og kortet står, hvor det skal
    const timer = setTimeout(() => setStatus("done"), INTRO_DURATION_S * 1000);

    return () => {
      clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
      cardAnimations.current.forEach((animation) => animation.cancel());
    };
  }, [status, revealRef]);

  // Spring over: kortet vises med det samme, og introen toner ud ovenpå
  function skip() {
    if (status !== "playing") {
      return;
    }
    cardAnimations.current.forEach((animation) => animation.cancel());
    setStatus("leaving");
  }

  // Når udtoningen er færdig, fjernes introen. Andre animationer "bobler" også op hertil, så vi tjekker.
  function handleAnimationEnd(event) {
    if (event.target === event.currentTarget && status === "leaving") {
      setStatus("done");
    }
  }

  if (status === "done") {
    return null;
  }

  return (
    <>
      {/* Stjernerummet – under headeren. data-status styrer udtoningen i CSS'en. */}
      <div
        className={styles.layer}
        data-status={status}
        onClick={skip}
        onAnimationEnd={handleAnimationEnd}
        aria-hidden="true"
      >
        <div ref={stageRef} className={styles.stage}>
          {/* Figma "Rum": mørkeblå baggrund med stjerner */}
          <div ref={skyRef} className={styles.sky}>
            <svg
              ref={starsRef}
              className={styles.stars}
              viewBox={`0 0 ${FRAME_WIDTH} ${FRAME_HEIGHT}`}
              preserveAspectRatio="none"
            >
              {STARS.map(([x, y, size], index) => (
                <circle key={index} cx={x + size / 2} cy={y + size / 2} r={size / 2} />
              ))}
              {TWINKLES.map(([x, y, size, opacity], index) => (
                <circle key={`t${index}`} cx={x + size / 2} cy={y + size / 2} r={size / 2} opacity={opacity} />
              ))}
            </svg>
          </div>

          {/* Figma "Plakater": placeringen kommer fra Figma, bevægelsen fra introTimeline.js */}
          {POSTERS.map((poster, index) => {
            const [left, top, width, height] = poster.box;
            return (
              <div
                key={index}
                ref={(element) => {
                  posterRefs.current[index] = element;
                }}
                className={styles.poster}
                style={{ left, top, width, height }}
              >
                <img
                  src={poster.image}
                  alt=""
                  className={poster.imageCrop ? styles.posterImageCropped : styles.posterImage}
                  style={poster.imageCrop}
                />
              </div>
            );
          })}

          {/* Figma "Scroll-markør" */}
          <div
            ref={scrollRef}
            className={styles.scroll}
            style={{ left: SCROLL_POSITION[0], top: SCROLL_POSITION[1] }}
          >
            <span>SCROLL</span>
            <span className={styles.scrollTrack}>
              <span className={styles.scrollLine} />
            </span>
          </div>
        </div>
      </div>

      {/* Nedtællingen – over alt, også headeren. Den glider selv op og ud og fjernes så. */}
      {showCountdown && (
        <div className={styles.countdownLayer} data-status={status} onClick={skip} aria-hidden="true">
          <IntroCountdown onDone={() => setShowCountdown(false)} />
        </div>
      )}

      {/* Til tastaturet: synlig, når man står på den med Tab */}
      <button type="button" className={styles.skip} onClick={skip}>
        Spring introen over
      </button>
    </>
  );
}
