import { Fredoka, Geist_Mono, Inter, Libre_Franklin } from "next/font/google";
import "./tokens.css";
import "./globals.css";

// Figma "Font-Family/Sekundær" – al almindelig tekst
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Figma "Font-Family/Primær" – bruges til store overskrifter via --font-family-display
const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
});

// Figma "Titel – hopper" – kun Katten med Hatten
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: "700",
});

// kun DataDump
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nordisk Film Biograf",
  description: "Film og spilletider hos Nordisk Film Biograf",
};

// Kun <html> og <body>. Header og footer ligger i layoutene for (site) og (start)
export default function RootLayout({ children }) {
  return (
    <html lang="da" className={`${inter.variable} ${libreFranklin.variable} ${fredoka.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
