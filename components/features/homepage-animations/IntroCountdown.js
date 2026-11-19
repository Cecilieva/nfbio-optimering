import styles from "./IntroCountdown.module.css";

// Tallene i den rækkefølge, de vises. Hvert tal får sin tur via --step i CSS'en.
const DIGITS = [3, 2, 1];

/**
 * Nedtællingen 3-2-1 i starten af introen, bygget som CSS-animation.
 * Figma: "Nedtælling" (node 1869:15878) i "Forside – intro (motion)". Tiderne er fra Figmas tidslinje:
 * hvert tal i 0,55 s, viseren drejer tre omgange, og efter 1,75 s glider det hele op ud af skærmen.
 *
 * @param {object} props
 * @param {() => void} [props.onSlideStart] Kaldes, når nedtællingen begynder at glide op
 * @param {() => void} [props.onDone] Kaldes, når nedtællingen er gledet helt ud
 */
export default function IntroCountdown({ onSlideStart, onDone }) {
  // Animationerne på tallene og viseren "bobler" op hertil. Kun selve udglidningen ligger på dette element.
  function handleAnimationStart(event) {
    if (event.target === event.currentTarget) {
      onSlideStart?.();
    }
  }

  function handleAnimationEnd(event) {
    if (event.target === event.currentTarget) {
      onDone?.();
    }
  }

  return (
    // Pynt: skærmlæsere springer den over
    <div
      className={styles.countdown}
      onAnimationStart={handleAnimationStart}
      onAnimationEnd={handleAnimationEnd}
      aria-hidden="true"
    >
      <div className={styles.dial}>
        <img src="/intro/ring.svg" alt="" className={styles.ring} />
        <span className={styles.crossVertical} />
        <span className={styles.crossHorizontal} />

        {/* Figma "Viser": lyskeglen og stregen drejer rundt om midten */}
        <div className={styles.hand}>
          <img src="/intro/lyskegle.png" alt="" className={styles.cone} />
          <span className={styles.line} />
        </div>

        {DIGITS.map((digit, index) => (
          <span key={digit} className={styles.digit} style={{ "--step": index }}>
            {digit}
          </span>
        ))}
      </div>

    </div>
  );
}
