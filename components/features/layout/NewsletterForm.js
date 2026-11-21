// "use client" fordi formularen skal vise et svar, uden at siden genindlæses
"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";
import styles from "./NewsletterForm.module.css";

// Figma: "Tilmelding" i footeren – et e-mailfelt og en "Tilmeld"-knap.
export default function NewsletterForm() {
  // useActionState kobler formularen til server action'en:
  //   state     – det, action'en sidst returnerede (null til at starte med)
  //   formAction – sættes på <form>, så formularen sendes til action'en
  //   isPending – true, mens vi venter på svar fra serveren
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, null);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.row}>
        {/* Designet viser ikke et label, så det skjules visuelt.
            Skærmlæsere kan stadig læse "E-mail til nyhedsbrevet". */}
        <TextField
          label="E-mail til nyhedsbrevet"
          hideLabel
          name="newsletter-email"
          type="email"
          placeholder="navn@mail.dk"
          autoComplete="email"
          required
          error={state?.error?.message}
          className={styles.field}
        />

        {/* Knappen er slået fra, mens vi venter, så man ikke kan klikke to gange */}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Tilmelder…" : "Tilmeld"}
        </Button>
      </div>

      {/* Feedback, når tilmeldingen lykkes.
          role="status" får skærmlæsere til at læse beskeden op, når den dukker op.
          Elementet er der hele tiden, så skærmlæseren opdager, når teksten ændrer sig. */}
      <p role="status" className={styles.status}>
        {state?.success && "Tak! Du er tilmeldt. Det er et studieprojekt, så du får ingen mails."}
      </p>
    </form>
  );
}
