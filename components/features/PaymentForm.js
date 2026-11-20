"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import Radio from "@/components/ui/Radio";
import { completePayment } from "@/lib/actions/booking";
import { PAYMENT_ERRORS } from "@/lib/payment-errors";

const METHODS = [
  { value: "mobilepay", label: "MobilePay" },
  { value: "card", label: "Betalingskort" },
  { value: "giftcard", label: "Gavekort" },
];

// Vælg betalingsmetode og betal.
// Betalingen er ikke rigtig, så der er et felt, hvor man selv vælger, om den lykkes eller fejler.
// Små fejl vises her i formularen. Store fejl sender brugeren videre til fejlsiden.
//
//   bookingId - id'et på reservationen, der skal betales
export default function PaymentForm({ bookingId }) {
  const [state, formAction, pending] = useActionState(completePayment, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="booking_id" value={bookingId} />

      <fieldset>
        <legend>Betalingsmetode</legend>
        {METHODS.map((method) => (
          <Radio key={method.value} name="method" value={method.value} label={method.label} required />
        ))}
      </fieldset>

      <fieldset>
        <legend>Simulér resultat (kun prototype)</legend>
        <select name="outcome" defaultValue="success" aria-label="Simuleret resultat">
          <option value="success">Betalingen går igennem</option>
          {Object.keys(PAYMENT_ERRORS).map((code) => (
            <option key={code} value={code}>
              Fejl {code}
            </option>
          ))}
        </select>
      </fieldset>

      {state?.error && (
        <p role="alert">
          {state.error.message} ({state.error.code})
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Betaler …" : "Betal"}
      </Button>
    </form>
  );
}
