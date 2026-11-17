"use client";

import { useEffect, useState } from "react";
import styles from "./IntroVideo.module.css";

// Figma: "Forside – intro (motion)" (node 1869:14851), eksporteret som video.
// Videoen vises i fuld skærm oven på forsiden, hver gang man kommer ind på siden.
// Den slutter på "Kommer snart"-kortet, som også står øverst på siden nedenunder.
// Når videoen er færdig, toner den ud, og man står på den rigtige side.
//
// Filen er Figmas eksport klippet til de første 7,2 sekunder (til kortet står stille).

/**
 * @param {object} props
 * @param {() => void} [props.onDone] Kaldes, når introen er væk (eller blev sprunget over)
 */
// Start fading this many seconds before the video ends, so the fade and the last frames overlap
// instead of the video stopping first. Same length as --duration-intro-fade in tokens.css.
const FADE_LEAD_S = 0.9;

export default function IntroVideo({ onDone }) {
  // "pending": vi ved endnu ikke, om introen skal vises (serveren kan ikke se brugerens indstillinger)
  // "playing": videoen kører
  // "leaving": videoen toner ud
  // "done": introen er væk
  const [status, setStatus] = useState("pending");

  // Kører i browseren, når komponenten er vist.
  // Har man bedt om mindre bevægelse i styresystemet, springer vi introen over.
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

  // Man kan ikke scrolle siden, mens introen vises
  useEffect(() => {
    if (status === "done") {
      return;
    }
    document.body.style.overflow = "hidden";
    // Funktionen, der returneres, kører, når status skifter – så kan man scrolle igen
    return () => {
      document.body.style.overflow = "";
    };
  }, [status]);

  // Videoen er færdig, eller man har sprunget over: tone ud
  function finish() {
    setStatus("leaving");
  }

  // Kortet står stille i videoens sidste sekund. Begynd at tone ud lidt før slutningen,
  // så videoen glider over i siden i stedet for at stoppe og så forsvinde.
  function handleTimeUpdate(event) {
    const video = event.currentTarget;
    if (status === "playing" && video.duration - video.currentTime <= FADE_LEAD_S) {
      finish();
    }
  }

  // Når udtoningen (CSS-animationen) er færdig, fjernes introen helt
  function handleAnimationEnd() {
    if (status === "leaving") {
      setStatus("done");
    }
  }

  if (status === "done") {
    return null;
  }

  return (
    // Klik hvor som helst for at springe over. data-status styrer udtoningen i CSS'en.
    <div
      className={styles.intro}
      data-status={status}
      onClick={finish}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* autoPlay virker kun, når videoen er muted. playsInline: ikke fuld skærm på iPhone. */}
      <video
        className={styles.video}
        src="/intro/intro.mp4"
        autoPlay
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={finish}
        aria-hidden="true"
      />

      {/* Teksten står allerede i videoen. Knappen er kun synlig, når man bruger tastaturet (Tab). */}
      <button type="button" className={styles.skip} onClick={finish}>
        Spring introen over
      </button>
    </div>
  );
}
