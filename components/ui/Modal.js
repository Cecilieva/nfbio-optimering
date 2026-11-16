"use client";

import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";

/**
 * A dialog on top of the page, e.g. the trailer. Uses <dialog>, so Escape and focus work.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose Called on Escape and on the close button
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 */
export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={dialogRef} onClose={onClose} aria-label={title} className={styles.modal}>
      <h2>{title}</h2>
      {children}
      <button type="button" onClick={onClose}>
        Luk
      </button>
    </dialog>
  );
}
