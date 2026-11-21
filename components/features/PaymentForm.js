"use client";

import { useActionState, useState } from "react";
import FormLoader from "@/components/features/FormLoader";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import InvalidFieldsMessage from "@/components/ui/InvalidFieldsMessage";
import Radio from "@/components/ui/Radio";
import { completePayment } from "@/lib/actions/booking";
import styles from "./PaymentForm.module.css";

const METHODS = [
  { value: "mobilepay", label: "MobilePay", description: "Hurtigst – godkend i appen" },
  { value: "card", label: "Betalingskort", description: "Visa, Mastercard, Dankort" },
  { value: "giftcard", label: "Gavekort / klippekort", description: "Indløs kode" },
];

// Vælg betalingsmetode og betal. Fejler betalingen, bliver metoden rød med fejlen under.
//
//   bookingId  - reservationen, der skal betales
//   seatsLabel - sæderne som tekst, fx "Række 4, sæde 6–7"
export default function PaymentForm({ bookingId, seatsLabel }) {
  const [state, formAction, pending] = useActionState(completePayment, null);
  const failedMethod = state?.error?.method;
  // Formularen nulstilles efter hvert forsøg. Vi husker valget, så det ikke springer tilbage
  const [selected, setSelected] = useState(METHODS[0].value);
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Lille forbogstav, så teksten passer midt i en sætning
  const seatsInText = seatsLabel.charAt(0).toLowerCase() + seatsLabel.slice(1);

  return (
    <section className={styles.card} aria-labelledby="payment-title">
      <h2 id="payment-title" className={styles.title}>
        Vælg betalingsmetode
      </h2>

      <form action={formAction} className={styles.form}>
        <input type="hidden" name="booking_id" value={bookingId} />

        <InvalidFieldsMessage className={styles.error} />

        <fieldset className={styles.methods}>
          <legend className="visually-hidden">Betalingsmetode</legend>
          {METHODS.map((method) => (
            <Radio
              key={method.value}
              name="method"
              value={method.value}
              label={method.label}
              description={method.description}
              error={method.value === failedMethod ? state.error.message : undefined}
              defaultChecked={selected === method.value}
              onChange={() => setSelected(method.value)}
              required
            />
          ))}
        </fieldset>

        <Checkbox
          name="terms"
          label="Jeg accepterer handelsbetingelserne"
          defaultChecked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
          required
        />

        {/* Andre fejl, fx hvis databasen ikke svarer */}
        {state?.error && !failedMethod && (
          <p role="alert" className={styles.error}>
            {state.error.message}
          </p>
        )}

        <Button type="submit" disabled={pending} className={styles.button}>
          {pending ? "Betaler …" : "Betal"}
        </Button>

        {/* always: loaderen vises altid, også på et hurtigt net */}
        <FormLoader
          always
          title="Reserverer pladser"
          text={`Vi reserverer ${seatsInText}. Det tager kun et øjeblik.`}
        />
      </form>
    </section>
  );
}
