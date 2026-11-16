"use client";

import { useEffect, useState } from "react";

/**
 * "Din billet printes …" for a moment, then the finished ticket (children).
 * The animation itself comes from Figma.
 *
 * @param {object} props
 * @param {number} [props.durationMs=2000]
 * @param {React.ReactNode} props.children The finished ticket
 */
export default function TicketPrint({ durationMs = 2000, children }) {
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setPrinted(true), durationMs);
    return () => clearTimeout(timeout);
  }, [durationMs]);

  if (!printed) {
    return <p role="status">Din billet printes …</p>;
  }

  return children;
}
