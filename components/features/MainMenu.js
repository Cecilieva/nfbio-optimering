"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import styles from "./MainMenu.module.css";

// TODO: point the placeholder links at real pages once they exist.
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

// Figma: "Menu" (node 1056:25687). The burger button plus a drawer that slides in from the left.
// Uses <dialog>, so Escape, focus trapping and the backdrop come from the browser.
export default function MainMenu({ triggerClassName }) {
  const dialogRef = useRef(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  // A click on the dialog element itself (not its content) is a click on the backdrop.
  const onDialogClick = (event) => {
    if (event.target === dialogRef.current) close();
  };

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-label="Menu"
        aria-haspopup="dialog"
        onClick={open}
      >
        <Image src="/icons/menu.svg" alt="" width={24} height={24} />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.drawer}
        aria-label="Menu"
        onClick={onDialogClick}
      >
        <div className={styles.panel}>
          <div className={styles.top}>
            <Link
              href="/film"
              className={styles.logo}
              aria-label="Nordisk Film Biografer – forside"
              onClick={close}
            >
              <Image src="/logo.svg" alt="" width={84.75} height={63.75} />
            </Link>
            <Button variant="secondary" onClick={close}>
              Luk <span aria-hidden="true">✕</span>
            </Button>
          </div>

          <nav aria-label="Hovedmenu" className={styles.nav}>
            <section className={styles.film}>
              <h2 className={styles.heading}>Film</h2>
              <ul className={styles.list}>
                {FILM_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.item} onClick={close}>
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

            <section className={styles.more}>
              <h2 className={styles.heading}>Mere</h2>
              <ul className={styles.moreList}>
                {MORE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.moreLink} onClick={close}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </nav>

          <div className={styles.profile}>
            <Button href="/login" onClick={close}>
              Log ind
            </Button>
            <Button variant="secondary" href="/signup" onClick={close}>
              Opret profil
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
