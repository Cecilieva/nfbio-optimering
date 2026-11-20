// "use client": checkboksen kører i browseren, fordi den selv viser sin fejl, når browseren afviser den (useState)
"use client";

import { useState } from "react";
import styles from "./Checkbox.module.css";

/**
 * En checkbox med sit label, fx "Husk mig" eller "Accepter handelsbetingelserne".
 * Figma: "Checkbox" (blå kant) og "Flueben" (når den er krydset af).
 *
 * Er den required og ikke krydset af, når formularen sendes, får boksen rød kant i stedet for browserens boble.
 * Teksten (requiredMessage) er kun for skærmlæsere – den synlige besked står samlet øverst i formularen
 * (InvalidFieldsMessage). Kanten forsvinder, når man sætter flueben.
 *
 * @param {object} props
 * @param {React.ReactNode} props.label
 * @param {string} props.name
 * @param {boolean} [props.defaultChecked]
 * @param {boolean} [props.required]
 * @param {string} [props.requiredMessage="Sæt flueben for at fortsætte."] Fejlen for skærmlæsere, når den mangler
 * @param {string} [props.className] Ekstra CSS-klasse til <label>, fx til tekst over flere linjer
 */
export default function Checkbox({
  label,
  name,
  className,
  requiredMessage = "Sæt flueben for at fortsætte.",
  onInvalid,
  onChange,
  ...rest
}) {
  const [showError, setShowError] = useState(false);
  const classes = className ? `${styles.checkbox} ${className}` : styles.checkbox;
  const errorId = showError ? `${name}-error` : undefined;

  function handleInvalid(event) {
    // preventDefault: ingen boble fra browseren – boksen får rød kant i stedet
    event.preventDefault();
    setShowError(true);

    // Uden boblen flytter browseren ikke fokus, så det gør vi – men kun til det første forkerte felt
    const input = event.currentTarget;
    if (input.form?.querySelector(":invalid") === input) {
      input.focus();
    }
    onInvalid?.(event);
  }

  function handleChange(event) {
    setShowError(false);
    onChange?.(event);
  }

  // Inputtet ligger inde i <label>, så et klik på teksten også krydser af
  return (
    <>
      <label className={classes}>
        <input
          type="checkbox"
          name={name}
          className={styles.input}
          aria-invalid={showError}
          aria-describedby={errorId}
          onInvalid={handleInvalid}
          onChange={handleChange}
          {...rest}
        />
        <span>{label}</span>
      </label>
      {/* Kun for skærmlæsere. Koblet til boksen med aria-describedby. */}
      {showError && (
        <span id={errorId} className={styles.hidden}>
          {requiredMessage}
        </span>
      )}
    </>
  );
}
