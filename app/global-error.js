// Fejlsiden, hvis selve layoutet fejler. Den erstatter layout.js,
// så den laver selv <html> og <body>. Ingen header og footer – det kan være dem, der fejler
"use client";

import ErrorState from "@/components/features/ErrorState";
import { fontClasses } from "./fonts";
import "./tokens.css";
import "./globals.css";

export default function GlobalError({ error, retry }) {
  return (
    <html lang="da" className={fontClasses}>
      <body>
        <title>Noget gik galt</title>
        <ErrorState error={error} retry={retry} />
      </body>
    </html>
  );
}
