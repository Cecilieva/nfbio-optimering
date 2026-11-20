"use client";

import Button from "@/components/ui/Button";

// Vises af error.js, når der sker en fejl på en side.
//
//   error - fejlen, der skete
//   retry - prøver at vise siden igen ("Prøv igen"-knappen)
//   title - overskriften (standard: "Noget gik galt")
export default function ErrorState({ error, retry, title = "Noget gik galt" }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>Vi kunne ikke hente siden. Prøv igen om lidt.</p>
      {error?.digest && <p>Fejlkode: {error.digest}</p>}
      <Button onClick={() => retry()}>Prøv igen</Button>
    </main>
  );
}
