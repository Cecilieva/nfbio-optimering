"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { attachBookingOwner } from "@/lib/actions/booking";

// Gør reservationen til din og går videre til betaling.
//
//   bookingId - id'et på reservationen
//   asGuest   - true: spørg efter navn og e-mail (gæst). Ellers bruges den, der er logget ind
//   email     - e-mailen på den, der er logget ind (står på knappen)
export default function AttachOwnerForm({ bookingId, asGuest = false, email }) {
  const [state, formAction, pending] = useActionState(attachBookingOwner, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="booking_id" value={bookingId} />
      {asGuest && (
        <>
          <TextField label="Navn" name="guest_name" autoComplete="name" />
          <TextField label="E-mail" name="guest_email" type="email" autoComplete="email" required />
        </>
      )}
      {state?.error && <p role="alert">{state.error.message}</p>}
      <Button type="submit" disabled={pending}>
        {asGuest ? "Fortsæt som gæst" : `Fortsæt som ${email}`}
      </Button>
    </form>
  );
}
