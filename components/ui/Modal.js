"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import styles from "./Modal.module.css";

/**
 * Pop op-vindue
 * bruger <dialog>, så Escape lukker af sig selv
 *
 * @param {object} props
 * @param {boolean} props.open true = vinduet er åbent
 * @param {() => void} props.onClose lukker vinduet
 * @param {string} props.title overskriften
 * @param {"large" | "small"} [props.size="large"] large = trailer-vinduet, small = en kort besked med luft om teksten
 * @param {React.ReactNode} props.children indholdet under overskriften
 */
export default function Modal({ open, onClose, title, size = "large", children }) {
  const dialogRef = useRef(null);

  // åbn/luk vinduet når "open" skifter
  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // klik på baggrunden lukker vinduet
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      aria-label={title}
      className={styles.modal}
      data-size={size}
    >
      {/* titel til venstre, luk til højre */}
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Button variant="secondary" onClick={onClose} className={styles.close}>
          <Image src="/icons/close.svg" alt="" width={15.536} height={12} />
          Luk
        </Button>
      </div>

      {/* en besked får luft om teksten - traileren fylder hele bredden */}
      {size === "small" ? <div className={styles.body}>{children}</div> : children}
    </dialog>
  );
}
