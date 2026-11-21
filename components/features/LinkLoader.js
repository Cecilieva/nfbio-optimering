"use client";

import { useLinkStatus } from "next/link";
import LoadingState from "@/components/features/LoadingState";

// Viser loaderen, mens et link henter den næste side. Læg den inde i et <Link>.
// På et langsomt net (fx 3G) sker der ellers ingenting efter klikket, fordi Next.js først kan vise
// sidens loading.js, når den er hentet. useLinkStatus ved, om linket er i gang.
//
//   always - true: vises med det samme, også på et hurtigt net (fx filmkortene på vej ind på en filmside)
export default function LinkLoader({ always = false }) {
  const { pending } = useLinkStatus();

  return pending ? <LoadingState always={always} /> : null;
}
