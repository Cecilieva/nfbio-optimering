"use client";

import Button from "@/components/ui/Button";

/**
 * Shown by error.js when a page throws. retry() renders the page again.
 *
 * @param {object} props
 * @param {Error} props.error
 * @param {() => void} props.retry
 * @param {string} [props.title="Noget gik galt"]
 */
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
