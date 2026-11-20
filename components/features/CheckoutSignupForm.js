"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Chip from "@/components/ui/Chip";
import InvalidFieldsMessage from "@/components/ui/InvalidFieldsMessage";
import TextField from "@/components/ui/TextField";
import { signUp } from "@/lib/actions/auth";
import styles from "./CheckoutSignupForm.module.css";

// Valgene under "Køn". value er det, der gemmes i profiles.gender (samme som SignUpForm)
const GENDERS = [
  { value: "kvinde", label: "Kvinde" },
  { value: "mand", label: "Mand" },
  { value: "andet", label: "Andet" },
  { value: "vil-ikke-oplyse", label: "Vil ikke oplyse" },
];

// De tre felter til fødselsdagen. label læses kun af skærmlæsere.
// pattern og patternMessage er de samme regler som i SignUpForm
const BIRTHDAY_FIELDS = [
  {
    label: "Dag",
    name: "birth_day",
    placeholder: "DD",
    maxLength: 2,
    autoComplete: "bday-day",
    pattern: "0?[1-9]|[12][0-9]|3[01]",
    patternMessage: "Skriv en dag fra 1 til 31.",
  },
  {
    label: "Måned",
    name: "birth_month",
    placeholder: "MM",
    maxLength: 2,
    autoComplete: "bday-month",
    pattern: "0?[1-9]|1[0-2]",
    patternMessage: "Skriv en måned fra 1 til 12.",
  },
  {
    label: "År",
    name: "birth_year",
    placeholder: "ÅÅÅÅ",
    maxLength: 4,
    autoComplete: "bday-year",
    pattern: "(19|20)[0-9]{2}",
    patternMessage: "Skriv året med 4 cifre, fx 1995.",
  },
];

// Findes datoen? Fx findes 31. februar ikke
function isRealDate(day, month, year) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// Mindst 8 tegn, ét tal og ét stort bogstav
const PASSWORD_PATTERN = "(?=.*\\d)(?=.*[A-ZÆØÅ]).{8,}";

// Formularen "Opret en BioPlus-profil" i købet.
// Når profilen er oprettet, sendes man tilbage til next og er logget ind.
// Navn, telefon, fødselsdag, postnummer, køn og nyhedsbrev gemmes på profilen (se signUp).
// Alle felter skal udfyldes - signUp afviser profilen, hvis noget mangler
//
//   next - adressen, man sendes tilbage til bagefter
export default function CheckoutSignupForm({ next }) {
  // Samme start som SignUpForm: "Vil ikke oplyse" er valgt
  const [gender, setGender] = useState("vil-ikke-oplyse");
  // Fejl, hvis de to adgangskoder ikke er ens
  const [passwordError, setPasswordError] = useState(null);

  // Før formularen sendes: findes fødselsdagen, og er de to adgangskoder ens?
  function checkForm(event) {
    const form = event.currentTarget;

    const day = form.elements.birth_day;
    const isValidDate = isRealDate(
      Number(day.value),
      Number(form.elements.birth_month.value),
      Number(form.elements.birth_year.value),
    );
    day.setCustomValidity(isValidDate ? "" : "Datoen findes ikke.");
    if (!isValidDate) {
      event.preventDefault();
      day.reportValidity();
      return;
    }

    if (form.password.value !== form.password_confirm.value) {
      event.preventDefault();
      setPasswordError("Adgangskoderne er ikke ens.");
      form.password_confirm.focus();
      return;
    }

    setPasswordError(null);
  }

  return (
    <form action={signUp} onSubmit={checkForm} className={styles.form}>
      {/* Efter oprettelsen sendes man tilbage hertil */}
      <input type="hidden" name="next" value={next} />

      {/* "Udfyld de markerede felter.", når et felt mangler eller er forkert. Felterne får rød kant */}
      <InvalidFieldsMessage className={styles.error} />

      <h3 className={styles.heading}>Personlige oplysninger</h3>

      <div className={styles.row}>
        <TextField label="Fornavn" name="first_name" placeholder="Anna" autoComplete="given-name" required />
        <TextField label="Efternavn" name="last_name" placeholder="Hansen" autoComplete="family-name" required />
      </div>

      {/* Én overskrift til tre felter. Skærmlæsere får "Dag", "Måned" og "År" */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Fødselsdag</legend>
        <div className={styles.row} data-columns="3">
          {BIRTHDAY_FIELDS.map((field) => (
            <TextField key={field.name} {...field} hideLabel inputMode="numeric" required />
          ))}
        </div>
      </fieldset>

      <div className={styles.row}>
        <TextField
          label="Telefon"
          name="phone"
          type="tel"
          placeholder="+45 12 34 56 78"
          autoComplete="tel"
          pattern="[+0-9 ]{8,}"
          patternMessage="Skriv et telefonnummer på mindst 8 cifre."
          required
        />
        <TextField
          label="Postnummer"
          name="postal_code"
          placeholder="8000"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]{4}"
          patternMessage="Skriv et postnummer på 4 cifre."
          required
        />
      </div>

      {/* Køn: man vælger én. Valget sendes med i et skjult felt */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Køn</legend>
        <div className={styles.chips}>
          {GENDERS.map((option) => (
            <Chip key={option.value} selected={gender === option.value} onClick={() => setGender(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
        <input type="hidden" name="gender" value={gender} />
      </fieldset>

      <hr className={styles.divider} />

      <h3 className={styles.heading}>Login</h3>

      <TextField label="E-mail" name="email" type="email" placeholder="navn@mail.dk" autoComplete="email" required />

      <div className={styles.row}>
        <TextField
          label="Adgangskode"
          name="password"
          type="password"
          placeholder="Mindst 8 tegn"
          autoComplete="new-password"
          pattern={PASSWORD_PATTERN}
          patternMessage="Brug mindst 8 tegn, ét tal og ét stort bogstav."
          required
        />
        <TextField
          label="Bekræft adgangskode"
          name="password_confirm"
          type="password"
          placeholder="Gentag adgangskode"
          autoComplete="new-password"
          error={passwordError}
          required
        />
      </div>
      <p className={styles.hint}>Brug mindst 8 tegn, ét tal og ét stort bogstav.</p>

      <hr className={styles.divider} />

      <Checkbox
        className={styles.consent}
        name="terms"
        required
        requiredMessage="Du skal acceptere medlemsvilkårene for at fortsætte."
        label={
          <>
            Jeg accepterer Nordisk Film Biografers <span className={styles.accent}>medlemsvilkår</span>.
          </>
        }
      />
      <Checkbox
        className={styles.consent}
        name="newsletter"
        label="Ja tak til nyhedsbreve, filmnyheder og tilbud på e-mail (valgfrit). Du kan altid framelde dig."
      />

      <Button type="submit" className={styles.button}>
        Opret profil
      </Button>
    </form>
  );
}
