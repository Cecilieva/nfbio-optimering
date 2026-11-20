// "use client": komponenten kører i browseren, fordi den skal lytte efter, at man skriver
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * En fejlbesked øverst i en formular, fx "Forkert e-mail eller adgangskode."
 * Bruges, når fejlen kommer fra ?error=true i adressen (sat af en server action).
 *
 * - Beskeden forsvinder, så snart man skriver i et af formularens felter igen.
 * - ?error fjernes fra adressen med det samme, så beskeden ikke kommer igen, hvis man genindlæser siden.
 *
 * Skal ligge inde i <form>.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Teksten i beskeden
 * @param {string} [props.className]
 */
export default function FormError({ children, className }) {
  const [visible, setVisible] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    // Fjern ?error fra adressen uden at genindlæse siden (resten af adressen, fx ?next=, bliver)
    const url = new URL(window.location.href);
    if (url.searchParams.has("error")) {
      url.searchParams.delete("error");
      window.history.replaceState(window.history.state, "", url);
    }

    // Skjul beskeden, når man skriver i et felt i den samme formular
    const form = ref.current?.closest("form");
    if (!form) {
      return;
    }
    const hide = () => setVisible(false);
    form.addEventListener("input", hide, { once: true });
    return () => form.removeEventListener("input", hide);
  }, []);

  if (!visible) {
    return null;
  }

  // role="alert": skærmlæsere læser fejlen op med det samme
  return (
    <p ref={ref} role="alert" className={className}>
      {children}
    </p>
  );
}
