// "use client" betyder, at komponenten kører i browseren.
// Det er nødvendigt, fordi menuen reagerer på klik (åbn og luk).
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Button from "@/components/ui/Button";
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

// Figma: "Menu".
// Burgerknappen i headeren plus menuen, der glider ind fra venstre.
// Menuen er et HTML-<dialog>. Så giver browseren os gratis:
//   - Escape lukker menuen
//   - tastaturfokus bliver inde i menuen, mens den er åben
//   - en mørk baggrund (backdrop) bag menuen
export default function MainMenu({ triggerClassName }) {
  // En ref er et "håndtag" til <dialog>-elementet, så vi kan åbne og lukke det
  const dialogRef = useRef(null);

  function openMenu() {
    dialogRef.current.showModal();
  }

  function closeMenu() {
    dialogRef.current.close();
  }

  // Luk menuen, når brugeren klikker på den mørke baggrund.
  // Et klik på baggrunden tæller som et klik på selve <dialog>,
  // mens et klik inde i menuen rammer et af elementerne indeni.
  function handleDialogClick(event) {
    if (event.target === dialogRef.current) {
      closeMenu();
    }
  }

  return (
    <>
      {/* Burgerknappen, der vises i headeren */}
      <button
        type="button"
        className={triggerClassName}
        aria-label="Menu"
        aria-haspopup="dialog"
        onClick={openMenu}
      >
        <Image src="/icons/menu.svg" alt="" width={24} height={24} />
      </button>

      {/* Selve menuen. Den er skjult, indtil showModal() bliver kaldt. */}
      <dialog
        ref={dialogRef}
        className={styles.drawer}
        aria-label="Menu"
        onClick={handleDialogClick}
      >
        <div className={styles.panel}>
          {/* Øverst: logo og luk-knap */}
          <div className={styles.top}>
            <Link
              href="/film"
              className={styles.logo}
              aria-label="Nordisk Film Biografer – forside"
              onClick={closeMenu}
            >
              <Image src="/logo.svg" alt="" width={84.75} height={63.75} />
            </Link>
            <Button variant="secondary" onClick={closeMenu}>
              Luk <span aria-hidden="true">✕</span>
            </Button>
          </div>

          <nav aria-label="Hovedmenu" className={styles.nav}>
            {/* Sektion 1: de store film-links */}
            <section className={styles.film}>
              <h2 className={styles.heading}>Film</h2>
              <ul className={styles.list}>
                {/* Lav ét link for hvert punkt i FILM_LINKS.
                    Hvert link lukker også menuen, når man klikker på det. */}
                {FILM_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.item} onClick={closeMenu}>
                      {/* Den blå streg og pilen vises kun ved hover (se CSS'en) */}
                      <span className={styles.marker} aria-hidden="true" />
                      <span className={styles.itemText}>{link.label}</span>
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <hr className={styles.divider} />

            {/* Sektion 2: de mindre "Mere"-links */}
            <section className={styles.more}>
              <h2 className={styles.heading}>Mere</h2>
              <ul className={styles.moreList}>
                {MORE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.moreLink} onClick={closeMenu}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </nav>

          {/* Nederst: log ind / opret profil */}
          <div className={styles.profile}>
            <Button href="/login" onClick={closeMenu}>
              Log ind
            </Button>
            <Button variant="secondary" href="/signup" onClick={closeMenu}>
              Opret profil
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
