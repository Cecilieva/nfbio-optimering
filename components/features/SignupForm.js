"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Chip from "@/components/ui/Chip";
import TextField from "@/components/ui/TextField";
import { signUp } from "@/lib/actions/auth";
import styles from "./SignupForm.module.css";

const GENDERS = ["Kvinde", "Mand", "Andet", "Vil ikke oplyse"];

// De tre felter til fødselsdagen. label læses kun af skærmlæsere
const BIRTHDAY_FIELDS = [
  { label: "Dag", name: "birth_day", placeholder: "DD", maxLength: 2, autoComplete: "bday-day" },
  { label: "Måned", name: "birth_month", placeholder: "MM", maxLength: 2, autoComplete: "bday-month" },
  { label: "År", name: "birth_year", placeholder: "ÅÅÅÅ", maxLength: 4, autoComplete: "bday-year" },
];

// Mindst 8 tegn, ét tal og ét stort bogstav
const PASSWORD_PATTERN = "(?=.*\\d)(?=.*[A-ZÆØÅ]).{8,}";

// Formularen "Opret en BioPlus-profil" i købet.
// Når profilen er oprettet, sendes man tilbage til next og er logget ind.
// Navn, telefon, fødselsdag, postnummer, køn og nyhedsbrev gemmes på profilen (se signUp)
//
//   next - adressen, man sendes tilbage til bagefter
export default function SignupForm({ next }) {
  const [gender, setGender] = useState(null);
  // Fejl, hvis de to adgangskoder ikke er ens
  const [passwordError, setPasswordError] = useState(null);

  // Tjek, at de to adgangskoder er ens, før formularen sendes
  function checkPasswords(event) {
    const form = event.currentTarget;

    if (form.password.value !== form.password_confirm.value) {
      event.preventDefault();
      setPasswordError("Adgangskoderne er ikke ens.");
      form.password_confirm.focus();
      return;
    }

    setPasswordError(null);
  }

  return (
    <form action={signUp} onSubmit={checkPasswords} className={styles.form}>
      {/* Efter oprettelsen sendes man tilbage hertil */}
      <input type="hidden" name="next" value={next} />

      <h3 className={styles.heading}>Personlige oplysninger</h3>

      <div className={styles.row}>
        <TextField label="Fornavn" name="first_name" placeholder="Anna" autoComplete="given-name" required />
        <TextField label="Efternavn" name="last_name" placeholder="Hansen" autoComplete="family-name" />
      </div>

      {/* Én overskrift til tre felter. Skærmlæsere får "Dag", "Måned" og "År" */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Fødselsdag</legend>
        <div className={styles.row} data-columns="3">
          {BIRTHDAY_FIELDS.map((field) => (
            <TextField key={field.name} {...field} hideLabel inputMode="numeric" />
          ))}
        </div>
      </fieldset>

      <div className={styles.row}>
        <TextField label="Telefon" name="phone" type="tel" placeholder="+45 12 34 56 78" autoComplete="tel" />
        <TextField
          label="Postnummer"
          name="postal_code"
          placeholder="8000"
          inputMode="numeric"
          autoComplete="postal-code"
        />
      </div>

      {/* Køn: man vælger én. Valget sendes med i et skjult felt */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Køn</legend>
        <div className={styles.chips}>
          {GENDERS.map((option) => (
            <Chip key={option} selected={gender === option} onClick={() => setGender(option)}>
              {option}
            </Chip>
          ))}
        </div>
        <input type="hidden" name="gender" value={gender ?? ""} />
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
          title="Brug mindst 8 tegn, ét tal og ét stort bogstav."
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
