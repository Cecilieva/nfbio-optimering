"use client";

import { useEffect, useId, useRef, useState } from "react";
import TextField from "@/components/ui/TextField";
import styles from "./FilterField.module.css";

// Små og store bogstaver tæller ikke med, når der søges i listen
function normalize(text) {
  return text.toLocaleLowerCase("da").trim();
}

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
 * @param {{ value: string, label: string, image?: string | null, group?: string }[]} props.options
 *   Det første punkt er "ingen filtrering", fx "Alle biografer". Har et punkt `image` (fx en plakat),
 *   vises billedet foran teksten. `image: null` giver en tom boks i samme størrelse.
 *   Punkter med samme `group` står samlet under en lille overskrift, fx "Sprog". Læg dem efter hinanden.
 * @param {string} props.value Det valgte punkts value
 * @param {(value: string) => void} props.onChange Kaldes, når man vælger et punkt
 * @param {boolean} props.open Er dropdownen åben?
 * @param {(open: boolean) => void} props.onOpenChange Kaldes, når feltet skal åbne eller lukke
 * @param {"bar" | "box"} [props.variant="bar"]
 * @param {string} [props.searchable] Giver dropdownen et søgefelt øverst, der gør listen kortere, mens man skriver.
 *   Teksten er feltets label for skærmlæsere og pladsholder, fx "Søg efter film".
 *   Dropdownen bliver bredere end feltet og står ud fra feltets højre kant – brug den til det sidste felt i baren.
 * @param {string} [props.emptyText] Kun med searchable: teksten, når der ikke er andet at vælge end "Alle …",
 *   fx "Ingen film passer til dine andre filtre."
 */
export default function FilterField({
  label,
  options,
  value,
  onChange,
  open,
  onOpenChange,
  variant = "bar",
  searchable,
  emptyText,
}) {
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

      {/* Dropdownen ligger lige under feltet.
          data-lenis-prevent: Lenis (den bløde scroll) rører ikke scrollen i listen – så scroller listen
          helt til bunds, uden at siden begynder at scrolle bagefter (se også overscroll-behavior i CSS'en) */}
      {open &&
        (searchable ? (
          <SearchDropdown
            listId={listId}
            label={label}
            searchLabel={searchable}
            emptyText={emptyText}
            options={options}
            selectedValue={selected.value}
            onChoose={choose}
          />
        ) : (
          <ul id={listId} className={styles.dropdown} aria-label={label} data-lenis-prevent>
            <OptionItems listId={listId} options={options} selectedValue={selected.value} onChoose={choose} />
          </ul>
        ))}
    </div>
  );
}

// Punkterne i listen. Punkter med en `group` står i en lille liste for sig med overskriften over,
// så skærmlæsere hører fx "Sprog, liste med 3 punkter".
function OptionItems({ listId, options, selectedValue, onChoose }) {
  // Saml punkterne i rækkefølge: punkter uden gruppe for sig, og punkter med samme gruppe sammen
  const blocks = [];
  for (const option of options) {
    const last = blocks.at(-1);
    if (option.group && last?.group === option.group) {
      last.options.push(option);
    } else {
      blocks.push({ group: option.group, options: [option] });
    }
  }

  return blocks.map((block, index) => {
    if (!block.group) {
      const option = block.options[0];
      return (
        <li key={option.value}>
          <Option option={option} selected={option.value === selectedValue} onChoose={onChoose} />
        </li>
      );
    }
    const headingId = `${listId}-group-${index}`;
    return (
      <li key={block.group} className={styles.group}>
        <span id={headingId} className={styles.groupLabel}>
          {block.group}
        </span>
        <ul className={styles.groupList} aria-labelledby={headingId}>
          {block.options.map((option) => (
            <li key={option.value}>
              <Option option={option} selected={option.value === selectedValue} onChoose={onChoose} />
            </li>
          ))}
        </ul>
      </li>
    );
  });
}

// Ét punkt i listen. aria-pressed viser det valgte punkt.
function Option({ option, selected, onChoose }) {
  return (
    <button
      type="button"
      className={styles.option}
      aria-pressed={selected}
      onClick={() => onChoose(option.value)}
    >
      {/* Billedet foran teksten, fx en plakat – eller en tom boks, hvis billedet mangler */}
      {option.image !== undefined &&
        (option.image ? (
          <img src={option.image} alt="" className={styles.image} />
        ) : (
          <span className={styles.image} aria-hidden="true" />
        ))}
      <span className={styles.optionLabel}>{option.label}</span>
    </button>
  );
}

// Dropdownen med søgefelt øverst. Den findes kun, mens dropdownen er åben,
// så det, man har skrevet, er væk næste gang den åbner.
function SearchDropdown({ listId, label, searchLabel, emptyText, options, selectedValue, onChoose }) {
  const [query, setQuery] = useState("");
  const listRef = useRef(null);

  // Mens man skriver: kun de punkter, hvis tekst indeholder det, man har skrevet.
  // "Alle …" står kun øverst, når feltet er tomt.
  const search = normalize(query);
  const shown = search ? options.slice(1).filter((option) => normalize(option.label).includes(search)) : options;

  // Er der ikke andet at vælge end "Alle …", står emptyText i stedet for listen – også før man har skrevet noget.
  // Ellers, når søgningen ikke rammer noget: "Ingen film passer til “in”" (samme tone som resten af siden)
  const nothingToChoose = options.length <= 1 && emptyText;
  const noMatch = nothingToChoose ? emptyText : `Ingen ${label.toLocaleLowerCase("da")} passer til “${query.trim()}”`;

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      // Enter vælger det første punkt, der passer
      event.preventDefault();
      if (search && shown.length > 0) {
        onChoose(shown[0].value);
      }
    } else if (event.key === "ArrowDown") {
      // Pil ned hopper fra søgefeltet ned i listen. Derfra bruges Tab.
      event.preventDefault();
      listRef.current?.querySelector("button")?.focus();
    }
  }

  return (
    <div className={styles.dropdown} data-searchable data-lenis-prevent>
      <TextField
        label={searchLabel}
        hideLabel
        name={`${listId}-search`}
        type="search"
        placeholder={searchLabel}
        autoComplete="off"
        enterKeyHint="search"
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.search}
      />

      {/* Skærmlæsere hører, hvor mange der passer. Står der hele tiden, så første ændring bliver læst op */}
      <p className="visually-hidden" aria-live="polite">
        {search && (shown.length === 1 ? "1 fundet" : `${shown.length} fundet`)}
      </p>

      {shown.length > 0 && !nothingToChoose ? (
        <ul ref={listRef} id={listId} className={styles.list} aria-label={label}>
          <OptionItems listId={listId} options={shown} selectedValue={selectedValue} onChoose={onChoose} />
        </ul>
      ) : (
        <p className={styles.empty}>{noMatch}</p>
      )}
    </div>
  );
}
