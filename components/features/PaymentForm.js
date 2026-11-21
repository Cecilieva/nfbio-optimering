"use client";

import { useActionState, useState } from "react";
import PaymentLoader from "@/components/features/PaymentLoader";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import InvalidFieldsMessage from "@/components/ui/InvalidFieldsMessage";
import Radio from "@/components/ui/Radio";
import { completePayment } from "@/lib/actions/booking";
import { useSubmitOnce } from "@/lib/use-submit-once";
import styles from "./PaymentForm.module.css";

const METHODS = [
  { value: "mobilepay", label: "MobilePay", description: "Hurtigst – godkend i appen" },
  { value: "card", label: "Betalingskort", description: "Visa, Mastercard, Dankort" },
  { value: "giftcard", label: "Gavekort / klippekort", description: "Indløs kode" },
];

// Vælg betalingsmetode og betal. Fejler betalingen, vises fejlsiden.
//
//   bookingId    - reservationen, der skal betales
//   seatsLabel   - sæderne som tekst, fx "Række 4, sæde 6–7"
//   initialError - fejlen fra fejlsiden: metoden bliver rød med fejlen under (valgfri)
export default function PaymentForm({ bookingId, seatsLabel, initialError }) {
  const [state, formAction, pending] = useActionState(completePayment, initialError ? { error: initialError } : null);
  // Stopper dobbeltklik
  const submitOnce = useSubmitOnce(pending);
  const failedMethod = state?.error?.method;
  // Husk valget, så det ikke springer tilbage. Fra fejlsiden er den fejlede metode valgt
  const [selected, setSelected] = useState(initialError?.method ?? METHODS[0].value);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <section className={styles.card} aria-labelledby="payment-title">
      <h2 id="payment-title" className={styles.title}>
        Vælg betalingsmetode
      </h2>

      <form action={formAction} onSubmit={submitOnce} className={styles.form}>
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

        <PaymentLoader seatsLabel={seatsLabel} />
      </form>
    </section>
  );
}
