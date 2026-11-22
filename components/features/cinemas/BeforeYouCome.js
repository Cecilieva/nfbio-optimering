import buttonStyles from "@/components/ui/Button.module.css";
import styles from "./BeforeYouCome.module.css";

/**
 * "Før du kommer" på biografsiden. Figma: "Før du kommer" (1661:28782).
 * Til venstre "Find os": kortet, adressen, "Find vej" og "Kontakt os".
 * Til højre "Praktisk info": Åbningstider, Parkering og Tog og bus – hver række kan foldes ud (Figma "Info-række").
 * En række uden tekst (fx Tog og bus i Viborg) vises ikke.
 *
 * @param {object} props
 * @param {{ name: string, address: string, street: string, postal: string | null,
 *   opening_hours: string | null, parking: string | null, transport: string | null, email: string | null }} props.cinema
 */
export default function BeforeYouCome({ cinema }) {
  // Kortet og "Find vej" bruger Google Maps ud fra navn og adresse – så skal vi ikke kende koordinaterne
  const place = encodeURIComponent(`Nordisk Film ${cinema.name}, ${cinema.address}`);
  const mapSrc = `https://maps.google.com/maps?q=${place}&z=15&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${place}`;

  const rows = [
    { title: "Åbningstider", icon: "/icons/clock.svg", text: cinema.opening_hours },
    { title: "Parkering", icon: "/icons/parking.svg", text: cinema.parking },
    { title: "Tog og bus", icon: "/icons/bus.svg", text: cinema.transport },
  ].filter((row) => row.text);

  return (
    <section className={styles.section} aria-labelledby="foer-du-kommer">
      {/* L/Sekundær/Bold */}
      <h2 id="foer-du-kommer" className={styles.title}>
        Før du kommer
      </h2>

      <div className={styles.content}>
        {/* Figma "Find os" */}
        <div className={styles.findUs}>
          <iframe
            className={styles.map}
            src={mapSrc}
            title={`Kort over ${cinema.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Figma "Adresse": gaden (S/Bold) og postnummer + by (S, sekundær) */}
          <address className={styles.address}>
            <span className={styles.street}>{cinema.street}</span>
            {cinema.postal && <span className={styles.postal}>{cinema.postal}</span>}
          </address>

          {/* Figma "Knapper". Begge går ud af sitet, så de er almindelige links med knappens udseende */}
          <div className={styles.buttons}>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles.button}
              data-variant="primary"
            >
              Find vej
              <span className="visually-hidden"> (åbner Google Maps i en ny fane)</span>
            </a>
            {cinema.email && (
              <a href={`mailto:${cinema.email}`} className={buttonStyles.button} data-variant="secondary">
                Kontakt os
              </a>
            )}
          </div>
        </div>

        {/* Figma "Praktisk info": <details> kan foldes ud med både mus og tastatur uden JavaScript */}
        <div className={styles.info}>
          {rows.map((row) => (
            <details key={row.title} className={styles.row}>
              <summary className={styles.summary}>
                {/* Figma "Ikonboks" */}
                <span className={styles.iconBox}>
                  <img src={row.icon} alt="" width={24} height={24} />
                </span>
                <span className={styles.rowTitle}>{row.title}</span>
                <img src="/icons/chevron-down.svg" alt="" width={16} height={11} className={styles.chevron} />
              </summary>
              <p className={styles.rowText}>{row.text}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
