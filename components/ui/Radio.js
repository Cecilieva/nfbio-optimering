import styles from "./Radio.module.css";

// En radioknap som en boks med titel og en lille tekst under, fx en betalingsmetode.
//
//   label       - titlen, fx "MobilePay"
//   description - teksten under (kan mangle)
//   error       - fejlbesked. Boksen bliver rød, og beskeden står under teksten
export default function Radio({ label, description, error, name, value, ...rest }) {
  // Kobler fejlbeskeden til knappen for skærmlæsere
  const errorId = error ? `${name}-${value}-error` : undefined;

  return (
    <label className={styles.option} data-error={Boolean(error)}>
      <input
        type="radio"
        name={name}
        value={value}
        className={styles.input}
        aria-describedby={errorId}
        {...rest}
      />
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
        {error && (
          <span id={errorId} className={styles.error}>
            {error}
          </span>
        )}
      </span>

      {/* Fejl-ikon (kun pynt) */}
      {error && (
        <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.9" fill="currentColor" />
        </svg>
      )}
    </label>
  );
}
