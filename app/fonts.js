import { Fredoka, Geist_Mono, Inter, Libre_Franklin } from "next/font/google";

// Sitets fonte. Bruges af layout.js og global-error.js

// Inter – al almindelig tekst
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Libre Franklin – store overskrifter
const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
});

// Fredoka – kun titlen på Katten med Hatten
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: "700",
});

// Geist Mono – kun DataDump
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Sættes på <html>, så CSS'en kan bruge fontene
export const fontClasses = `${inter.variable} ${libreFranklin.variable} ${fredoka.variable} ${geistMono.variable}`;
