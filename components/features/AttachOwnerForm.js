"use client";

import { useActionState } from "react";
import FormLoader from "@/components/features/FormLoader";
import Button from "@/components/ui/Button";
import InvalidFieldsMessage from "@/components/ui/InvalidFieldsMessage";
import TextField from "@/components/ui/TextField";
import { attachBookingOwner } from "@/lib/actions/booking";
import styles from "./AttachOwnerForm.module.css";

// Gør reservationen til din og går videre til betaling.
// Imens vises den almindelige loader ("Indlæser") over hele skærmen, indtil betalingen er klar.
//
//   bookingId  - id'et på reservationen
//   asGuest    - true: spørg efter navn, telefon og e-mail (gæst). Ellers bruges den, der er logget ind
//   children   - ekstra indhold under knappen, fx "Har du en rabatkode?"
//   email      - e-mailen på den, der er logget ind (står på knappen)
export default function AttachOwnerForm({ bookingId, asGuest = false, email, children }) {
  const [state, formAction, pending] = useActionState(attachBookingOwner, null);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="booking_id" value={bookingId} />
      {/* "Udfyld de markerede felter.", hvis et felt mangler (fx e-mailen) */}
      <InvalidFieldsMessage className={styles.error} />
      {asGuest && (
        <>
          {/* autoFocus: felterne vises først, når man har valgt "Fortsæt som gæst" - så står man klar i det første */}
          <TextField
            label="Navn"
            name="guest_name"
            placeholder="Dit fulde navn"
            autoComplete="name"
            autoFocus
          />
          {/* Telefon gemmes ikke endnu - databasen har ingen kolonne til det */}
          <TextField
            label="Telefon"
            name="guest_phone"
            type="tel"
            placeholder="12345678"
            autoComplete="tel"
            inputMode="tel"
          />
          <TextField
            label="Email"
            name="guest_email"
            type="email"
            placeholder="navn@mail.dk"
            autoComplete="email"
            required
          />
        </>
      )}
      {state?.error && (
        <p role="alert" className={styles.error}>
          {state.error.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className={styles.button}>
        {asGuest ? "Fortsæt som gæst" : `Fortsæt som ${email}`}
      </Button>
      {children}

      {/* Mens man sendes videre til betaling, vises loaderen over hele skærmen */}
      <FormLoader />
    </form>
  );
}
