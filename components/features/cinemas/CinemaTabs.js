import styles from "./CinemaTabs.module.css";

// Fanerne fra Figma (Program, Events & nyheder, Om filmformater) – kun til at se på.
// De linker ikke til noget og har intet indhold. "Program" står som den valgte, som i Figma.
const TABS = ["Program", "Events & nyheder", "Om filmformater"];

// Bjælken med fanerne under "By-header" på biografsiden.
// aria-hidden: den er kun pynt, så skærmlæsere springer den over
export default function CinemaTabs() {
  return (
    <div className={styles.bar} aria-hidden="true">
      <ul className={styles.list}>
        {TABS.map((tab, index) => (
          <li key={tab} className={styles.tab} data-active={index === 0 || undefined}>
            {tab}
          </li>
        ))}
      </ul>
    </div>
  );
}
