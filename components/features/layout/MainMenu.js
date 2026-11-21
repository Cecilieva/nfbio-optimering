import Link from "next/link";
import LinkLoader from "@/components/features/loading/LinkLoader";
import Button from "@/components/ui/Button";
import SidePanel, { SidePanelHeading, SidePanelItem } from "./SidePanel";
import styles from "./MainMenu.module.css";

// Linkene i menuen. Når de står i en liste, kan vi tilføje eller fjerne
// et link her uden at røre HTML'en længere nede.
// TODO: peg pladsholder-linkene på rigtige sider, når de findes.
const FILM_LINKS = [
  { label: "Film i biografen", href: "/film" },
  { label: "Kommende film", href: "/film" },
  { label: "Biografer", href: "/by" },
  { label: "Events", href: "/film" },
];

const MORE_LINKS = [
  { label: "Gavekort", href: "/film" },
  { label: "BIOPLUS", href: "/film" },
  { label: "Spørgsmål og svar", href: "/film" },
  { label: "Om Nordisk Film Biografer", href: "/film" },
];

// Figma: "Menu" (1056:25687).
// Burgerknappen i headeren plus menuen, der glider ind fra venstre (SidePanel).
export default function MainMenu({ triggerClassName }) {
  return (
    <SidePanel
      label="Menu"
      triggerLabel="Menu"
      triggerIcon="/icons/menu.svg"
      triggerClassName={triggerClassName}
    >
      {/* Panelet lukker selv, når man klikker på et af linkene */}
      <nav aria-label="Hovedmenu">
        {/* Sektion 1: de store film-links */}
        <section>
          <SidePanelHeading>FILM</SidePanelHeading>
          <ul className={styles.list}>
            {FILM_LINKS.map((link) => (
              <li key={link.label}>
                <SidePanelItem href={link.href}>{link.label}</SidePanelItem>
              </li>
            ))}
          </ul>
        </section>

        <hr className={styles.divider} />

        {/* Sektion 2: de mindre "Mere"-links */}
        <section>
          <SidePanelHeading>MERE</SidePanelHeading>
          <ul className={styles.moreList}>
            {MORE_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={styles.moreLink}>
                  {link.label}
                  <LinkLoader />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </nav>

      {/* Nederst: log ind / opret profil */}
      <div className={styles.profile}>
        <Button href="/login">Log ind</Button>
        <Button variant="secondary" href="/signup">
          Opret profil
        </Button>
      </div>
    </SidePanel>
  );
}
