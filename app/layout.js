import { fontClasses } from "./fonts";
import "./tokens.css";
import "./globals.css";

export const metadata = {
  title: "Nordisk Film Biograf",
  description: "Film og spilletider hos Nordisk Film Biograf",
};

// Kun <html> og <body>. Header og footer ligger i route-gruppernes layouts
export default function RootLayout({ children }) {
  return (
    <html lang="da" className={fontClasses}>
      <body>{children}</body>
    </html>
  );
}
