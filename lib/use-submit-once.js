import { useEffect, useRef } from "react";

// Stopper dobbeltklik: mens formularen sendes, bliver klik nummer to ignoreret.
// Kommer der en fejl tilbage, kan man sende igen.
//
//   pending  - fra useActionState: true, mens formularen sendes
//   onSubmit - formularens eget tjek før afsendelse (valgfri)
//
// Brug: const submitOnce = useSubmitOnce(pending)  ->  <form onSubmit={submitOnce}>
export function useSubmitOnce(pending, onSubmit) {
  const sending = useRef(false);

  // Svaret er kommet – man må sende igen
  useEffect(() => {
    if (!pending) {
      sending.current = false;
    }
  }, [pending]);

  return function handleSubmit(event) {
    // Allerede på vej – stop klikket
    if (sending.current) {
      event.preventDefault();
      return;
    }

    onSubmit?.(event);

    // Stoppede formularens eget tjek den, er den ikke på vej
    if (!event.defaultPrevented) {
      sending.current = true;
    }
  };
}
