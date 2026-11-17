"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

/**
 * "Se trailer" – opens the trailer in a Modal.
 *
 * @param {object} props
 * @param {string} [props.trailerUrl] A YouTube link (watch, youtu.be or embed). Without one, the modal says
 *   the trailer is not out yet.
 * @param {string} props.title The film's title
 */
export default function TrailerButton({ trailerUrl, title }) {
  const [open, setOpen] = useState(false);
  const embedUrl = toEmbedUrl(trailerUrl);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Image src="/icons/play.svg" alt="" width={18} height={18} />
        Se trailer
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Trailer: ${title}`}>
        {open && embedUrl && <iframe src={embedUrl} title={`Trailer: ${title}`} allowFullScreen />}
        {open && !embedUrl && <p>Traileren er ikke ude endnu.</p>}
      </Modal>
    </>
  );
}

// YouTube refuses to show a normal watch link inside an iframe, so turn it into an embed link:
// https://www.youtube.com/watch?v=ID or https://youtu.be/ID → https://www.youtube.com/embed/ID
// Other links (fx already /embed/) are used as they are. null when there is no link.
function toEmbedUrl(url) {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("youtube.com") && parsed.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
  } catch {
    // Not a valid URL – use it as it is
  }
  return url;
}
