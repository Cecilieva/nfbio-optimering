// "use client" betyder, at komponenten kører i browseren.
// Det er nødvendigt, fordi panelet reagerer på klik (åbn og luk).
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import styles from "./SidePanel.module.css";

/**
 * Et panel, der glider ind fra siden (Figma "Menu" 1056:25687 og "Byskift" 2588:40783).
 * Det kommer fra samme side som knappen, der åbner det: menuen fra venstre, byskiftet fra højre.
 * Øverst står "Luk". Bruges af MainMenu og CityMenu.
 *
 * Panelet er et HTML-<dialog>. Så giver browseren os gratis:
 *   - Escape lukker panelet
 *   - tastaturfokus bliver inde i panelet, mens det er åbent
 *   - en mørk baggrund (backdrop) bag panelet
 *
 * @param {object} props
 * @param {string} props.label Navnet på panelet til skærmlæsere, fx "Menu"
 * @param {string} props.triggerLabel Teksten på knappen i headeren til skærmlæsere
 * @param {string} props.triggerIcon Ikonet på knappen i headeren, fx "/icons/menu.svg"
 * @param {string} [props.triggerClassName] Headerens stil til knappen
 * @param {"left" | "right"} [props.side="left"] Hvilken side panelet glider ind fra
 * @param {React.ReactNode} props.children Indholdet under toppen
 */
export default function SidePanel({
  label,
  triggerLabel,
  triggerIcon,
  triggerClassName,
  side = "left",
  children,
}) {
  // En ref er et "håndtag" til <dialog>-elementet, så vi kan åbne og lukke det
  const dialogRef = useRef(null);

  function open() {
    dialogRef.current.showModal();
  }

  function close() {
    dialogRef.current.close();
  }

  // Luk panelet, når man klikker på den mørke baggrund eller på et link i panelet.
  // Et klik på baggrunden rammer selve <dialog>, et klik i panelet rammer et element indeni.
  function handleDialogClick(event) {
    if (event.target === dialogRef.current || event.target.closest("a")) {
      close();
    }
  }

  return (
    <>
      {/* Knappen i headeren, der åbner panelet */}
      <button
        type="button"
        className={triggerClassName}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        onClick={open}
      >
        <Image src={triggerIcon} alt="" width={24} height={24} />
      </button>

      {/* Selve panelet. Det er skjult, indtil showModal() bliver kaldt. */}
      <dialog
        ref={dialogRef}
        className={styles.drawer}
        data-side={side}
        aria-label={label}
        onClick={handleDialogClick}
        onSubmit={close} // Sender man en formular i panelet (fx vælger en by), lukker det også
      >
        <div className={styles.panel}>
          {/* Øverst: kun luk-knappen. Logoet er fjernet - det fyldte meget og gjorde ikke noget,
              som punkterne i panelet ikke allerede gør */}
          <div className={styles.top}>
            <Button variant="secondary" onClick={close}>
              Luk
              {/* Figma-ikonet "Luk" i 18px */}
              <Image src="/icons/close.svg" alt="" width={18} height={18} />
            </Button>
          </div>

          {children}
        </div>
      </dialog>
    </>
  );
}

/**
 * Overskriften over en gruppe punkter, fx "FILM" eller "Vælg by".
 */
export function SidePanelHeading({ children }) {
  return <h2 className={styles.heading}>{children}</h2>;
}

/**
 * Ét stort punkt i panelet (Figma "Menupunkt"). Den blå streg og pilen vises ved hover.
 * Med href bliver det et link, ellers en knap (fx til at sende en formular).
 * Er punktet valgt (fx den by, man har valgt), kan man ikke klikke på det. Det ser ud som
 * hover-tilstanden, men med et flueben i stedet for pilen.
 *
 * @param {object} props
 * @param {string} [props.href]
 * @param {boolean} [props.divider] Streg under punktet, som i Byskift
 * @param {boolean} [props.selected] Punktet er valgt - vises med flueben og kan ikke klikkes
 */
export function SidePanelItem({ href, divider, selected, children, ...rest }) {
  const content = (
    <>
      <span className={styles.marker} aria-hidden="true" />
      <span className={styles.itemText}>
        {children}
        {/* Kun til skærmlæsere */}
        {selected && <span className="visually-hidden"> (valgt)</span>}
      </span>
      {selected ? (
        // Blåt flueben, når punktet er valgt (farven sættes i CSS'en)
        <span className={styles.check} aria-hidden="true" />
      ) : (
        // Figma-ikonet "frem"
        <Image
          className={styles.arrow}
          src="/icons/chevron-right.svg"
          alt=""
          width={16}
          height={15.5}
        />
      )}
    </>
  );

  // Valgt: ikke et link eller en knap, bare tekst
  if (selected) {
    return (
      <p
        className={styles.item}
        data-divider={divider || undefined}
        data-selected
        aria-current="true"
      >
        {content}
      </p>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={styles.item}
        data-divider={divider || undefined}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={styles.item}
      data-divider={divider || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
