import Link from "next/link";
import styles from "./StepHeader.module.css";

// Toppen af hvert trin i købsflowet:
// "Tilbage", trinbjælken (de trin, man er nået til, er blå) og titlen med en undertekst.
//
//   step       - hvilket trin vi er på (1-4)
//   totalSteps - hvor mange streger bjælken har
//   title      - fx "Vælg antal pladser"
//   subtitle   - fx "Clayface · i dag kl. 19.30 · Aarhus Bio"
//   backHref   - "Tilbage" er et link hertil …
//   onBack     - … eller en knap, der kalder denne funktion (fx tilbage til forrige fase på samme side)
export default function StepHeader({ step, totalSteps = 4, title, subtitle, backHref, onBack }) {
  // Pilen og teksten er ens, uanset om "Tilbage" er et link eller en knap
  const backContent = (
    <>
      <img src="/icons/chevron-down.svg" alt="" className={styles.backIcon} />
      Tilbage
    </>
  );

  // Fx [1, 2, 3, 4] - én streg pr. trin
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <div className={styles.header}>
      {onBack && (
        <button type="button" className={styles.back} onClick={onBack}>
          {backContent}
        </button>
      )}
      {!onBack && backHref && (
        <Link href={backHref} className={styles.back}>
          {backContent}
        </Link>
      )}

      {/* Trinbjælken. Skærmlæsere får teksten "Trin 1 af 4" i stedet for stregerne */}
      <div className={styles.steps} role="img" aria-label={`Trin ${step} af ${totalSteps}`}>
        {steps.map((number) => (
          <span key={number} className={styles.step} data-done={number <= step} />
        ))}
      </div>

      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
