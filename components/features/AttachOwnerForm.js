"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { attachBookingOwner } from "@/lib/actions/booking";

/**
 * Makes the reservation yours and continues to payment.
 * asGuest: asks for name and email. Otherwise it uses the logged-in user.
 *
 * @param {object} props
 * @param {string} props.bookingId
 * @param {boolean} [props.asGuest]
 * @param {string} [props.email] The logged-in user's email, shown on the button
 */
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
