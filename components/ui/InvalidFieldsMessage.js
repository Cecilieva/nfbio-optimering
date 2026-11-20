// "use client": beskeden kører i browseren, fordi den lytter efter, når browseren afviser felter (useState)
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Én samlet besked øverst i en formular, når der er felter, der mangler eller er forkerte.
 * Felterne selv (TextField, Checkbox) får rød kant.
 *
 * - Vises, når man prøver at sende formularen, og browseren afviser et felt.
 * - Forsvinder igen, når alle markerede felter er rettet.
 *
 * Skal ligge inde i <form>.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.children="Udfyld de markerede felter."]
 * @param {string} [props.className]
 */
export default function InvalidFieldsMessage({ children = "Udfyld de markerede felter.", className }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) {
      return;
    }

    // "invalid" bobler ikke op til formularen, så vi lytter i capture-fasen (true)
    const show = () => setVisible(true);
    form.addEventListener("invalid", show, true);

    // Felterne fjerner deres aria-invalid, når man retter dem. Er der ingen tilbage, skjules beskeden.
    const observer = new MutationObserver(() => {
      if (!form.querySelector('[aria-invalid="true"]')) {
        setVisible(false);
      }
    });
    observer.observe(form, { subtree: true, attributes: true, attributeFilter: ["aria-invalid"] });

    return () => {
      form.removeEventListener("invalid", show, true);
      observer.disconnect();
    };
  }, []);

  // hidden i stedet for at fjerne elementet, så ref'en altid peger ind i formularen.
  // role="alert": skærmlæsere læser beskeden op, når den bliver vist.
  return (
    <p ref={ref} role="alert" hidden={!visible} className={className}>
      {children}
    </p>
  );
}
