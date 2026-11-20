"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import AttachOwnerForm from "@/components/features/AttachOwnerForm";
import CheckoutSignupForm from "@/components/features/CheckoutSignupForm";
import Button from "@/components/ui/Button";
import InvalidFieldsMessage from "@/components/ui/InvalidFieldsMessage";
import TextField from "@/components/ui/TextField";
import { signInOnPage } from "@/lib/actions/auth";
import styles from "./CheckoutLogin.module.css";

// Kortet til højre på "Dine oplysninger". Det viser én af fire ting:
//   Logget ind        - "Du er logget ind" og én knap, der gør brugeren til ejer af reservationen
//   mode = "guest"    - "Gæstebestilling" med navn, telefon og e-mail (adressen har ?gaest=1)
//   mode = "signup"   - "Opret en BioPlus-profil" (adressen har ?opret=1)
//   mode = "login"    - "Har du en profil?": log ind, fortsæt som gæst eller opret profil
//
//   bookingId  - id'et på reservationen
//   next       - adressen på siden, så login og "Opret profil" sender en tilbage hertil bagefter
//   email      - e-mailen på den, der er logget ind (ellers tom)
//   seatsLabel - sæderne som tekst til "Vi popper dine pladser …", fx "Række 4, sæde 6–7"
//   mode       - "login", "guest" eller "signup" (se ovenfor)
export default function CheckoutLogin({ bookingId, next, email, seatsLabel, mode = "login" }) {
  // Om feltet til rabatkoden vises (efter "Klik her")
  const [showDiscount, setShowDiscount] = useState(false);
  // Log ind: virker det ikke, får vi en fejl tilbage og bliver på siden
  const [loginState, loginAction, loggingIn] = useActionState(signInOnPage, null);

  if (email) {
    return (
      <Card title="Du er logget ind" intro="Billetten bliver gemt på din profil.">
        <AttachOwnerForm bookingId={bookingId} email={email} seatsLabel={seatsLabel} />
      </Card>
    );
  }

  if (mode === "signup") {
    return (
      <Card
        title="Opret en BioPlus-profil"
        intro="Bestil hurtigere, anmeld film og få invitationer til forpremierer og events."
        spacious
      >
        <CheckoutSignupForm next={next} />
      </Card>
    );
  }

  if (mode === "guest") {
    return (
      <Card
        title="Gæstebestilling"
        intro="Oplysningerne gemmes kun midlertidigt i forbindelse med din bestilling, og ingen profil bliver oprettet."
      >
        <AttachOwnerForm bookingId={bookingId} asGuest seatsLabel={seatsLabel}>
          {/* "Klik her" viser feltet til rabatkoden. Koden bliver ikke brugt til noget endnu */}
          {showDiscount ? (
            <TextField label="Rabatkode" name="discount_code" autoComplete="off" autoFocus />
          ) : (
            <p className={styles.note}>
              Har du en rabatkode?{" "}
              <button type="button" className={styles.link} onClick={() => setShowDiscount(true)}>
                Klik her
              </button>
            </p>
          )}
        </AttachOwnerForm>
      </Card>
    );
  }

  return (
    <Card title="Har du en profil?" intro="Log ind for at samle point og finde billetten igen på 2 sekunder.">
      <form action={loginAction} className={styles.form}>
        {/* Efter login sendes man tilbage til denne side */}
        <input type="hidden" name="next" value={next} />
        {/* "Udfyld de markerede felter.", hvis et felt mangler */}
        <InvalidFieldsMessage className={styles.error} />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          placeholder="navn@mail.dk"
          autoComplete="email"
          defaultValue={loginState?.email}
          required
        />
        <TextField
          label="Adgangskode"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        {/* Fejlbeskeden, fx hvis profilen ikke findes. role="alert": skærmlæsere læser den op */}
        {loginState?.error && (
          <p role="alert" className={styles.error}>
            {loginState.error.message}
          </p>
        )}
        <Button type="submit" disabled={loggingIn} className={styles.button}>
          Log ind
        </Button>
      </form>

      {/* Stregen med "eller" i midten - kun pynt */}
      <div className={styles.divider} aria-hidden="true">
        eller
      </div>

      {/* "more" har samme mørke kant som kortene og felterne på siden */}
      <Button variant="more" href={`${next}?gaest=1`} className={styles.button}>
        Fortsæt som gæst
      </Button>

      <p className={styles.note}>
        Ingen profil? <Link href={`${next}?opret=1`}>Opret profil</Link>
      </p>
    </Card>
  );
}

// Rammen om kortet: overskrift, en kort tekst og indholdet under.
// spacious: 24px mellem delene i stedet for 16px (bruges til "Opret profil")
function Card({ title, intro, spacious = false, children }) {
  return (
    <section className={styles.card} data-spacious={spacious} aria-labelledby="checkout-login-title">
      <h2 id="checkout-login-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.intro}>{intro}</p>
      {children}
    </section>
  );
}
