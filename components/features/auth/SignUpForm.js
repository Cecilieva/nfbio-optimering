// "use client": formularen kører i browseren, fordi den skal huske, hvilket trin man er på (useState)
"use client";

import Link from "next/link";
import LinkLoader from "@/components/features/loading/LinkLoader";
import { useEffect, useRef, useState } from "react";
import FormLoader from "@/components/features/loading/FormLoader";
import { AuthHeading, AuthNote } from "./AuthScreen";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Chip from "@/components/ui/Chip";
import FormError from "@/components/ui/FormError";
import InvalidFieldsMessage from "@/components/ui/InvalidFieldsMessage";
import TextField from "@/components/ui/TextField";
import { signUp } from "@/lib/actions/auth";
import styles from "./SignUpForm.module.css";

// Overskriften og teksten på hvert trin (Figma "Opret profil – trin 1" og "– trin 2")
const STEPS = {
  1: {
    title: "Bliv en del af BioPlus",
    intro: "Bestil billetter hurtigere, anmeld film og få invitationer til forpremierer og events.",
  },
  2: {
    title: "Fortæl os lidt om dig",
    intro: "Så kan vi sende dig fødselsdagstilbud, finde din nærmeste biograf og sende billetter på SMS.",
  },
};

// Valgene under "Køn". value er det, der gemmes i profiles.gender.
const GENDERS = [
  { value: "kvinde", label: "Kvinde" },
  { value: "mand", label: "Mand" },
  { value: "andet", label: "Andet" },
  { value: "vil-ikke-oplyse", label: "Vil ikke oplyse" },
];

// Findes datoen? Fx findes 31. februar ikke
function isRealDate(day, month, year) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * "Opret profil" i to trin – én formular, så det man har skrevet i trin 1, bliver,
 * når man går til trin 2 og tilbage igen. Profilen oprettes først på "Bliv BioPlus-medlem".
 *
 * Trin 1: navn, e-mail, adgangskode og samtykke. Trin 2: fødselsdag, telefon, postnummer og køn.
 * Det trin, man ikke er på, er skjult (hidden), men felterne bliver i formularen og sendes med.
 *
 * @param {object} props
 * @param {string} props.next Hvor man skal hen bagefter, fx tilbage til bestillingen
 * @param {boolean} [props.error] true, når signUp sendte en tilbage med ?error=true
 */
export default function SignUpForm({ next, error = false }) {
  const [step, setStep] = useState(1);
  // Figma viser "Vil ikke oplyse" valgt fra start
  const [gender, setGender] = useState("vil-ikke-oplyse");

  // Overskriften får fokus, når man skifter trin, så skærmlæsere læser det nye trin op
  const titleRef = useRef(null);
  const stepChanged = useRef(false);

  useEffect(() => {
    if (!stepChanged.current) {
      return;
    }
    titleRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  function goToStep(number) {
    stepChanged.current = true;
    setStep(number);
  }

  // Enter og "Fortsæt" på trin 1 sender formularen. Browseren har allerede tjekket felterne i trin 1
  // (felterne i trin 2 er kun required på trin 2), så her går vi bare videre i stedet for at sende.
  function handleSubmit(event) {
    if (step === 1) {
      event.preventDefault();
      goToStep(2);
      return;
    }

    // Trin 2: tjek, at fødselsdagen findes, før profilen oprettes
    const form = event.currentTarget;
    const day = form.elements.birth_day;
    const isValid = isRealDate(
      Number(day.value),
      Number(form.elements.birth_month.value),
      Number(form.elements.birth_year.value),
    );
    day.setCustomValidity(isValid ? "" : "Datoen findes ikke.");
    if (!isValid) {
      event.preventDefault();
      day.reportValidity();
    }
  }

  return (
    <>
      <AuthHeading eyebrow="BIOPLUS" title={STEPS[step].title} intro={STEPS[step].intro} titleRef={titleRef} />

      <form action={signUp} onSubmit={handleSubmit} className={styles.form}>
        {/* Sendes med, så signUp ved hvor man skal hen bagefter */}
        <input type="hidden" name="next" value={next} />

        {/* "Udfyld de markerede felter.", når et felt mangler eller er forkert – på begge trin.
            Felterne får rød kant. */}
        <InvalidFieldsMessage className={styles.error} />

        {/* Figma "Felter" – trin 1 */}
        <div className={styles.step} hidden={step !== 1}>
          {/* Fejlen forsvinder, når man skriver igen, og kommer ikke igen ved genindlæsning (se FormError) */}
          {error && (
            <FormError className={styles.error}>
              Profilen kunne ikke oprettes. Måske er e-mailen allerede i brug.
            </FormError>
          )}

          {/* Figma "Navn": fornavn og efternavn ved siden af hinanden */}
          <div className={styles.row}>
            <TextField
              label="Fornavn *"
              name="first_name"
              placeholder="Anna"
              autoComplete="given-name"
              required
              className={styles.grow}
            />
            <TextField
              label="Efternavn *"
              name="last_name"
              placeholder="Hansen"
              autoComplete="family-name"
              required
              className={styles.grow}
            />
          </div>
          <TextField
            label="E-mail *"
            name="email"
            type="email"
            placeholder="navn@mail.dk"
            autoComplete="email"
            required
          />
          <TextField
            label="Adgangskode *"
            name="password"
            type="password"
            placeholder="Mindst 8 tegn"
            autoComplete="new-password"
            minLength={8}
            required
          />

          {/* Figma "Samtykke": to checkbokse med 8px imellem */}
          <div className={styles.consent}>
            {/* TODO: Der findes ingen side med medlemsvilkår endnu, så ordet er blåt, men ikke et link */}
            <Checkbox
              name="terms"
              required
              requiredMessage="Du skal acceptere medlemsvilkårene for at fortsætte."
              className={styles.consentItem}
              label={
                <>
                  Jeg har læst og accepterer BioPlus <span className={styles.link}>medlemsvilkår</span> *
                </>
              }
            />
            {/* Samtykke til markedsføring må ikke være et krav for at oprette en profil, så den er frivillig.
                TODO: "Læs mere" skal pege på en side om nyhedsbrevet, når den findes */}
            <Checkbox
              name="newsletter"
              className={styles.consentItem}
              label={
                <>
                  Ja tak til nyhedsbreve og tilbud fra NF Bio og samarbejdspartnere på e-mail og SMS.{" "}
                  <span className={styles.link}>Læs mere</span>
                </>
              }
            />
          </div>

          <Button type="submit" className={styles.fullWidth}>
            Fortsæt
          </Button>
        </div>

        {/* Figma "Felter" – trin 2. Felterne er kun required her, så de ikke stopper "Fortsæt" på trin 1. */}
        <div className={styles.step} hidden={step !== 2}>
          {/* Figma "Fødselsdag": dag, måned og år ved siden af hinanden.
              onInput: retter man dag, måned eller år, fjernes fejlen "Datoen findes ikke." igen,
              ellers ville feltet blive ved med at være ugyldigt, og formularen kunne ikke sendes. */}
          <div className={styles.row} onInput={(event) => event.currentTarget.querySelector("input").setCustomValidity("")}>
            <TextField
              label="Fødselsdag *"
              name="birth_day"
              placeholder="DD"
              inputMode="numeric"
              autoComplete="bday-day"
              pattern="0?[1-9]|[12][0-9]|3[01]"
              patternMessage="Skriv en dag fra 1 til 31."
              maxLength={2}
              required={step === 2}
              className={styles.grow}
            />
            <TextField
              label="Måned *"
              name="birth_month"
              placeholder="MM"
              inputMode="numeric"
              autoComplete="bday-month"
              pattern="0?[1-9]|1[0-2]"
              patternMessage="Skriv en måned fra 1 til 12."
              maxLength={2}
              required={step === 2}
              className={styles.grow}
            />
            <TextField
              label="År *"
              name="birth_year"
              placeholder="ÅÅÅÅ"
              inputMode="numeric"
              autoComplete="bday-year"
              pattern="(19|20)[0-9]{2}"
              patternMessage="Skriv året med 4 cifre, fx 1995."
              maxLength={4}
              required={step === 2}
              className={styles.grow}
            />
          </div>

          {/* Figma "Telefon og postnummer" */}
          <div className={styles.row}>
            <TextField
              label="Telefon *"
              name="phone"
              type="tel"
              placeholder="+45 12 34 56 78"
              autoComplete="tel"
              pattern="[+0-9 ]{8,}"
              patternMessage="Skriv et telefonnummer på mindst 8 cifre."
              required={step === 2}
              className={styles.grow}
            />
            <TextField
              label="Postnummer *"
              name="postal_code"
              placeholder="8000"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{4}"
              patternMessage="Skriv et postnummer på 4 cifre."
              maxLength={4}
              required={step === 2}
              className={styles.grow}
            />
          </div>

          {/* Figma "Køn": Chip-knapperne (Option button). Det valgte sendes med i det skjulte felt. */}
          <div className={styles.gender}>
            <p id="gender-label" className={styles.genderLabel}>
              Køn *
            </p>
            <div className={styles.genderOptions} role="group" aria-labelledby="gender-label">
              {GENDERS.map((option) => (
                <Chip key={option.value} selected={gender === option.value} onClick={() => setGender(option.value)}>
                  {option.label}
                </Chip>
              ))}
            </div>
            <input type="hidden" name="gender" value={gender} />
          </div>

          <Button type="submit" className={styles.fullWidth}>
            Bliv BioPlus-medlem
          </Button>
        </div>
        {/* Viser "Indlæser", mens formularen sendes */}
        <FormLoader />
      </form>

      {step === 1 ? (
        <AuthNote>
          Har du allerede en profil? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log ind<LinkLoader /></Link>
        </AuthNote>
      ) : (
        <AuthNote>
          Gik du for hurtigt?{" "}
          <button type="button" onClick={() => goToStep(1)}>
            Tilbage til trin 1
          </button>
        </AuthNote>
      )}
    </>
  );
}
