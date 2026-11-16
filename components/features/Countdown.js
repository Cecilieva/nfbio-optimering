"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Time left on the reservation, e.g. "9:58". Starts on the client, so the server
 * and the browser don't disagree about the time.
 *
 * @param {object} props
 * @param {string} props.until reserved_until from the booking
 */
export default function Countdown({ until }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  if (now === null) {
    return <p>Dine pladser er reserveret</p>;
  }

  const remaining = new Date(until).getTime() - now;

  if (remaining <= 0) {
    return <p role="alert">Reservationen er udløbet.</p>;
  }

  return (
    <p>
      Dine pladser er reserveret i <time>{formatRemaining(remaining)}</time>
    </p>
  );
}
