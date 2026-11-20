// "use client": feltet kører i browseren, fordi det selv viser sin fejl, når browseren afviser det (useState)
"use client";

import { useState } from "react";
import styles from "./TextField.module.css";

// Vores egen tekst i stedet for browserens grå boble ("Udfyld dette felt.")
function messageFor(input, patternMessage) {
  const { validity } = input;

  if (validity.valueMissing) {
    return "Feltet skal udfyldes.";
  }
  if (validity.typeMismatch && input.type === "email") {
    return "Skriv en gyldig e-mail, fx navn@mail.dk.";
  }
  if (validity.tooShort) {
    return `Skal være mindst ${input.minLength} tegn.`;
  }
  if (validity.patternMismatch) {
    return patternMessage ?? "Tjek, at feltet er udfyldt rigtigt.";
  }
  // Fx en fejl, som koden har sat med setCustomValidity ("Datoen findes ikke.")
  return input.validationMessage;
}

/**
 * Et label og et inputfelt, med en evt. fejlbesked under.
 * Figma: "Inputfelt".
 *
 * Afviser browseren feltet, når formularen sendes (fx required eller type="email"), får feltet rød kant
 * i stedet for browserens boble. Den præcise fejl ("Skriv en gyldig e-mail …") er kun for skærmlæsere –
 * den synlige besked står samlet øverst i formularen (InvalidFieldsMessage). Kanten forsvinder, når man skriver.
 *
 * @param {object} props
 * @param {string} props.label Teksten, der fortæller, hvad feltet er til
 * @param {string} props.name Bruges også som id
 * @param {string} [props.type="text"]
 * @param {string} [props.error] Vises under feltet og kobles til feltet med aria-describedby
 * @param {string} [props.patternMessage] Teksten, når feltet ikke passer til pattern, fx "Skriv et postnummer på 4 cifre."
 * @param {boolean} [props.hideLabel] Skjuler labelet visuelt, men skærmlæsere kan stadig læse det.
 *   Bruges når designet ikke viser et label, fx nyhedsbrevet i footeren.
 * @param {string} [props.className] Ekstra CSS-klasse til den ydre boks
 */
export default function TextField({
  label,
  name,
  type = "text",
  error,
  patternMessage,
  hideLabel = false,
  className,
  onInvalid,
  onInput,
  ...rest
}) {
  // Fejlen fra browserens tjek – null, når feltet er i orden
  const [invalidMessage, setInvalidMessage] = useState(null);

  // En fejl fra forælderen vinder over browserens
  const shownError = error || invalidMessage;

  // Fejlbeskeden får sit eget id, så inputfeltet kan pege på den
  const errorId = shownError ? `${name}-error` : undefined;

  // Fejlen fra forælderen vises under feltet. Browserens fejl er kun for skærmlæsere.
  const errorClass = error ? styles.error : styles.hiddenLabel;

  function handleInvalid(event) {
    // preventDefault: ingen boble fra browseren – feltet får rød kant i stedet
    event.preventDefault();
    const input = event.currentTarget;
    setInvalidMessage(messageFor(input, patternMessage));

    // Uden boblen flytter browseren ikke fokus, så det gør vi – men kun til det første forkerte felt
    if (input.form?.querySelector(":invalid") === input) {
      input.focus();
    }
    onInvalid?.(event);
  }

  function handleInput(event) {
    // Man er i gang med at rette – fjern fejlen igen
    setInvalidMessage(null);
    onInput?.(event);
  }

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
        aria-invalid={Boolean(shownError)}
        aria-describedby={errorId}
        onInvalid={handleInvalid}
        onInput={handleInput}
        {...rest}
      />
      {/* Koblet til feltet med aria-describedby, så skærmlæsere læser fejlen, når man står i feltet */}
      {shownError && (
        <p id={errorId} className={errorClass}>
          {shownError}
        </p>
      )}
    </div>
  );
}
