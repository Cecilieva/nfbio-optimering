"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./FilterField.module.css";

/**
 * Ét felt i filtreringsbaren med en dropdown under sig.
 * Figma: "Filterfelt" og punkterne i listen "Dropdown valg".
 *
 * Tilstande som i Figma:
 *   Valgt – der er valgt noget andet end det første punkt ("Alle …"): blå kant
 *   Åben  – dropdownen er åben: lysere baggrund og pilen peger op
 *
 * Forælderen styrer, hvilket felt der er åbent, så der kun er ét ad gangen.
 *
 * Varianter:
 *   bar – feltet i filtreringsbaren på forsiden (uden kant)
 *   box – et felt for sig selv med baggrund og kant, fx biograf-vælgeren ved spilletiderne
 *
 * @param {object} props
 * @param {string} props.label Den lille tekst øverst, fx "Biograf"
 * @param {{ value: string, label: string }[]} props.options Det første punkt er "ingen filtrering", fx "Alle biografer"
 * @param {string} props.value Det valgte punkts value
 * @param {(value: string) => void} props.onChange Kaldes, når man vælger et punkt
 * @param {boolean} props.open Er dropdownen åben?
 * @param {(open: boolean) => void} props.onOpenChange Kaldes, når feltet skal åbne eller lukke
 * @param {"bar" | "box"} [props.variant="bar"]
 */
export default function FilterField({ label, options, value, onChange, open, onOpenChange, variant = "bar" }) {
  // Et unikt id, så knappen kan pege på sin liste (aria-controls)
  const listId = useId();
  const fieldRef = useRef(null);
  const triggerRef = useRef(null);

  const selected = options.find((option) => option.value === value) ?? options[0];
  // "Valgt" i Figma: der er valgt noget andet end "Alle …"
  const isFiltered = selected.value !== options[0].value;

  // Mens dropdownen er åben: Escape lukker den, og et klik uden for feltet lukker den også
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onOpenChange(false);
        // Fokus tilbage på feltet, så man ikke mister sin plads med tastaturet
        triggerRef.current?.focus();
      }
    }

    function handlePointerDown(event) {
      if (!fieldRef.current?.contains(event.target)) {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, onOpenChange]);

  // Vælg et punkt, luk listen og sæt fokus tilbage på feltet
  function choose(nextValue) {
    onChange(nextValue);
    onOpenChange(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      ref={fieldRef}
      className={styles.field}
      data-variant={variant}
      data-open={open}
      data-filtered={isFiltered}
    >
      {/* aria-expanded fortæller skærmlæsere, om listen er åben */}
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => onOpenChange(!open)}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.row}>
          <span className={styles.value}>{selected.label}</span>
          {/* Pilen peger ned, når listen er lukket, og op, når den er åben (to ikoner fra Figma) */}
          <img
            src={open ? "/icons/chevron-up.svg" : "/icons/chevron-down.svg"}
            alt=""
            width={16}
            height={11}
            className={styles.chevron}
          />
        </span>
      </button>

      {/* Dropdown listen ligger lige under feltet. aria-pressed viser det valgte punkt. */}
      {open && (
        <ul id={listId} className={styles.dropdown} aria-label={label}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={styles.option}
                aria-pressed={option.value === selected.value}
                onClick={() => choose(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
