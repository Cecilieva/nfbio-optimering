// Fejlsiden for hele købsflowet (alle sider under /bestil).
// Går noget galt på en af siderne - fx hvis databasen ikke svarer -
// viser Next.js denne side i stedet for, at hele sitet går i stykker.
//
// "use client" skal stå øverst, fordi Next.js kræver, at en fejlside kører i browseren.
"use client";

import ErrorState from "@/components/features/messages/ErrorState";

// error - fejlen, der skete
// retry - en funktion, der prøver at vise siden igen (bruges af "Prøv igen"-knappen)
export default function Error({ error, retry }) {
  return <ErrorState error={error} retry={retry} />;
}
