import styles from "./Seat.module.css";

// Formerne på hyndet, ryglænet og kørestolen
const CUSHION =
  "M4.5 8.8C4.5 6.7 4.5 5.6 4.8 4.8C5.3 3.4 6.4 2.3 7.8 1.8C8.6 1.5 9.7 1.5 11.8 1.5H12.2C14.3 1.5 15.4 1.5 16.2 1.8C17.6 2.3 18.7 3.4 19.2 4.8C19.5 5.6 19.5 6.7 19.5 8.8V8.8C19.5 10.8 19.5 11.9 19.2 12.7C18.7 14.1 17.6 15.2 16.2 15.7C15.4 16 14.3 16 12.2 16H11.8C9.7 16 8.6 16 7.8 15.7C6.4 15.2 5.3 14.1 4.8 12.7C4.5 11.9 4.5 10.8 4.5 8.8V8.8Z";
const BACKREST = "M2.5 18.5C8.8 21.8 15.2 21.8 21.5 18.5";
const WHEELCHAIR =
  "M9.9 8.3V13.4H14.8L17.1 17.1M7.4 10.9C4.1 12.5 4.2 18.1 8.3 19C10.7 19.6 12.9 18.3 13.6 15.9";

// Ét sæde, tegnet som SVG.
// Farverne står i CSS'en (tokens), så sæderne skifter farve i familie-mode.
// Sædet er kun til at se på (aria-hidden) - forælderen sørger for teksten til skærmlæsere.
//
//   state      - "free" (ledig), "selected" (valgt) eller "taken" (optaget)
//   wheelchair - true for en kørestolsplads
//   className  - ekstra klasse fra forælderen, fx til størrelse og placering
//   …rest      - fx style
export default function Seat({ state = "free", wheelchair = false, className, ...rest }) {
  let classes = styles.seat;
  if (className) {
    classes = `${styles.seat} ${className}`;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={classes}
      data-state={state}
      {...rest}
    >
      {wheelchair ? (
        <>
          {/* Kørestolsplads: en firkant med en kørestol */}
          <rect className={styles.box} width="24" height="24" rx="5" />
          <circle className={styles.head} cx="10.8" cy="5.3" r="1.6" />
          <path className={styles.symbol} d={WHEELCHAIR} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {state === "taken" && (
            <>
              {/* Krydset har en "udsparing" bag sig, så det kan ses oven på kørestolen */}
              <path className={styles.crossGap} d="M8 8L16 16M16 8L8 16" strokeWidth="4.6" strokeLinecap="round" />
              <path className={styles.cross} d="M8 8L16 16M16 8L8 16" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
        </>
      ) : (
        <>
          {/* Almindeligt sæde: ryglæn, to armlæn og hynde */}
          <path className={styles.frame} d={BACKREST} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect className={styles.arm} y="3" width="3" height="11" rx="1.5" />
          <rect className={styles.arm} x="21" y="3" width="3" height="11" rx="1.5" />
          <path className={styles.cushion} d={CUSHION} />
          {state === "taken" && (
            <path className={styles.cross} d="M8.5 5.2L15.5 12.2M15.5 5.2L8.5 12.2" strokeWidth="2.2" strokeLinecap="round" />
          )}
        </>
      )}
    </svg>
  );
}
