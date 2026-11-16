"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

/**
 * "Se trailer" – opens the trailer in a Modal.
 *
 * @param {object} props
 * @param {string} props.trailerUrl An embeddable URL, e.g. https://www.youtube.com/embed/…
 * @param {string} props.title The film's title
 */
export default function TrailerButton({ trailerUrl, title }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Se trailer
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Trailer: ${title}`}>
        {open && <iframe src={trailerUrl} title={`Trailer: ${title}`} allowFullScreen />}
      </Modal>
    </>
  );
}
