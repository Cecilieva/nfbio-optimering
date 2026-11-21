"use client";

import { useLinkStatus } from "next/link";
import LoadingState from "./LoadingState";

// Viser loaderen, mens et link henter den næste side. Læg den inde i et <Link>.
// Den gamle side bliver stående, indtil den nye er klar - imens viser vi loaderen (efter 1 sekund).
// useLinkStatus ved, om linket er i gang.
//
//   always - true: vises med det samme, også på et hurtigt net (fx filmkortene på vej ind på en filmside)
export default function LinkLoader({ always = false }) {
  const { pending } = useLinkStatus();

  return pending ? <LoadingState always={always} /> : null;
}
