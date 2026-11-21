import { fontClasses } from "./fonts";
import { MOTION_SCRIPT } from "@/lib/motion";
import "./tokens.css";
import "./globals.css";

export const metadata = {
  title: "Nordisk Film Biograf",
  description: "Film og spilletider hos Nordisk Film Biograf",
};

// Kun <html> og <body>. Header og footer ligger i route-gruppernes layouts
export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: MOTION_SCRIPT sætter data-motion i browseren, før React starter,
    // så <html> ser ikke ens ud på serveren og i browseren. Det er meningen.
    <html lang="da" className={fontClasses} suppressHydrationWarning>
      <head>
        {/* Skal køre, før siden tegnes, så animationerne ikke når at starte (se lib/motion.js) */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
