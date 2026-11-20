"use client";

import { useEffect, useState } from "react";

// Viser "Din billet printes …" et øjeblik og derefter den færdige billet.
//
//   durationMs - hvor længe "printes" vises (2000 = 2 sekunder)
//   children   - den færdige billet
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
