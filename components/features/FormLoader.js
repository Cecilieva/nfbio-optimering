"use client";

import { useFormStatus } from "react-dom";
import LoadingState from "@/components/features/LoadingState";

// Viser den almindelige loader ("Indlæser"), mens formularen, den står i, bliver sendt.
// Læg den inde i <form> - så virker den af sig selv (useFormStatus ved, om formularen er i gang).
// Bruges i formularer, der sender en videre til en ny side, fx log ind, vælg by og betaling.
//
//   title, text, always - sendes videre til LoadingState, fx "Reserverer pladser" ved betaling (valgfri)
export default function FormLoader({ title, text, always }) {
  const { pending } = useFormStatus();

  return pending ? <LoadingState title={title} text={text} always={always} /> : null;
}
