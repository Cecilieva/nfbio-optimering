import styles from "./TextField.module.css";

/**
 * Et label og et inputfelt, med en evt. fejlbesked under.
 * Figma: "Inputfelt".
 *
 * @param {object} props
 * @param {string} props.label Teksten, der fortæller, hvad feltet er til
 * @param {string} props.name Bruges også som id
 * @param {string} [props.type="text"]
 * @param {string} [props.error] Vises under feltet og kobles til feltet med aria-describedby
 * @param {boolean} [props.hideLabel] Skjuler labelet visuelt, men skærmlæsere kan stadig læse det.
 *   Bruges når designet ikke viser et label, fx nyhedsbrevet i footeren.
 * @param {string} [props.className] Ekstra CSS-klasse til den ydre boks
 */
export default function TextField({
  label,
  name,
  type = "text",
  error,
  hideLabel = false,
  className,
  ...rest
}) {
  // Fejlbeskeden får sit eget id, så inputfeltet kan pege på den
  const errorId = error ? `${name}-error` : undefined;

  // Tilføj den ekstra klasse fra forælderen, hvis der er en
  let fieldClasses = styles.field;
  if (className) {
    fieldClasses = `${styles.field} ${className}`;
  }

  return (
    <div className={fieldClasses}>
      <label htmlFor={name} className={hideLabel ? styles.hiddenLabel : styles.label}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={styles.input}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...rest}
      />
      {/* role="alert" gør, at skærmlæsere læser fejlen op med det samme */}
      {error && (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
