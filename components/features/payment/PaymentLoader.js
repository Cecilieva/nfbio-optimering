"use client";

import FormLoader from "@/components/features/loading/FormLoader";

// "Reserverer pladser", mens betalingen sendes. Læg den inde i <form>.
// Bruges på betalingen og ved "Prøv igen". always: vises også på et hurtigt net.
//
//   seatsLabel - sæderne som tekst, fx "Række 4, sæde 6–7"
export default function PaymentLoader({ seatsLabel }) {
  // Lille forbogstav, så teksten passer midt i en sætning
  const seatsInText = seatsLabel.charAt(0).toLowerCase() + seatsLabel.slice(1);

  return <FormLoader always title="Reserverer pladser" text={`Vi reserverer ${seatsInText}. Det tager kun et øjeblik.`} />;
}
