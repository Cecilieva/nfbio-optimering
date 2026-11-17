import { Geist_Mono, Inter, Libre_Franklin } from "next/font/google";
import "./tokens.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Figma "Font-Family/Primær" – bruges til store overskrifter via --font-family-display
const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nordisk Film Biograf",
  description: "Film og spilletider hos Nordisk Film Biograf",
};

// Header and footer live in the route layouts: app/(site)/layout.js and app/by/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="da" className={`${inter.variable} ${libreFranklin.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
