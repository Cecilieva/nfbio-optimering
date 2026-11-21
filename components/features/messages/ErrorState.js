"use client";

import { useEffect } from "react";
import MessagePage from "./MessagePage";
import Button from "@/components/ui/Button";

// Fejlsiden. Vises af error.js og global-error.js. Samme design som 404-siden (MessagePage)
//
//   error - fejlen
//   retry - viser siden igen ("Prøv igen")
export default function ErrorState({ error, retry }) {
  // Fejlen skrives i konsollen, så vi kan se, hvad der gik galt
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MessagePage
      eyebrow="Åh nej.."
      title="Noget gik galt hos os."
      buttons={
        <>
          <Button onClick={() => retry()}>Prøv igen</Button>
          {/* Der er ingen supportside endnu, så den peger på forsiden */}
          <Button href="/film" variant="secondary">
            Gå til support
          </Button>
        </>
      }
    >
      Det er ikke din skyld – vi kunne ikke hente indholdet lige nu. Prøv igen om et øjeblik, eller gå til forsiden,
      mens vi får styr på det.
    </MessagePage>
  );
}
