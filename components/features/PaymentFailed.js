"use client";

import { useActionState } from "react";
import PaymentLoader from "@/components/features/PaymentLoader";
import Button from "@/components/ui/Button";
import Overlay from "@/components/ui/Overlay";
import PopcornLoader from "@/components/ui/PopcornLoader";
import { completePayment } from "@/lib/actions/booking";
import styles from "./PaymentFailed.module.css";

// "Betalingen fejlede" med de brændte popkorn.
// "Prøv igen" betaler igen med samme metode. "Vælg anden betaling" går tilbage til betalingen.
//
//   bookingId   - reservationen
//   method      - metoden, der fejlede, fx "card"
//   minutesLeft - minutter, sæderne stadig holdes
//   seatsLabel  - sæderne som tekst (til loaderen)
export default function PaymentFailed({ bookingId, method, minutesLeft, seatsLabel }) {
  // Lykkes eller fejler betalingen, sendes man videre. state får kun andre fejl
  const [state, formAction, pending] = useActionState(completePayment, null);

  return (
    // role="alert": skærmlæsere læser den op med det samme
    <Overlay role="alert" title="Betalingen fejlede" illustration={<PopcornLoader burnt />}>
      <p className={styles.text}>
        Betalingen gik ikke igennem, men dine sæder er stadig reserveret i {minutesLeft}{" "}
        {minutesLeft === 1 ? "minut" : "minutter"}, og pengene er ikke blevet trukket.
      </p>

      <div className={styles.actions}>
        <form action={formAction} className={styles.form}>
          {/* Samme felter som betalingsformularen */}
          <input type="hidden" name="booking_id" value={bookingId} />
          <input type="hidden" name="method" value={method} />
          <Button type="submit" disabled={pending}>
            Prøv igen
          </Button>
          <PaymentLoader seatsLabel={seatsLabel} />
        </form>

        {/* "more": kanten er border/Standard */}
        <Button variant="more" href={`/bestil/${bookingId}/betaling?fejl=${encodeURIComponent(method)}`}>
          Vælg anden betaling
        </Button>
      </div>

      {/* Fx hvis tiden løb ud imens */}
      {state?.error && (
        <p role="alert" className={styles.error}>
          {state.error.message}
        </p>
      )}
    </Overlay>
  );
}
