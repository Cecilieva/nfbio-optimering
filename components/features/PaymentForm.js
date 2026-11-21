"use client";

import { useActionState } from "react";
import FormLoader from "@/components/features/FormLoader";
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
//   bookingId  - id'et på reservationen, der skal betales
//   seatsLabel - sæderne som tekst, fx "Række 4, sæde 6–7" (fra formatSeats)
export default function PaymentForm({ bookingId, seatsLabel }) {
  const [state, formAction, pending] = useActionState(completePayment, null);
  // "Række 4, sæde 6–7" -> "række 4, sæde 6–7", så den passer midt i sætningen
  const seatsInText = seatsLabel.charAt(0).toLowerCase() + seatsLabel.slice(1);

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

      {/* Mens betalingen går igennem, hopper popkornene over hele skærmen.
          always: den vises altid (også på et hurtigt net), så man kan se, at pladserne bliver reserveret */}
      <FormLoader
        always
        title="Reserverer pladser"
        text={`Vi reserverer ${seatsInText}. Det tager kun et øjeblik.`}
      />
    </form>
  );
}
