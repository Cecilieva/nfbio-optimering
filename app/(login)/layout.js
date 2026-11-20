import Header from "@/components/features/Header";
import styles from "./layout.module.css";

// Layout for route-gruppen "(login)": kun /login.
// Parenteserne betyder, at "(login)" IKKE kommer med i URL'en.
// Figma "Log ind side" har den fulde header, men ingen footer.
export default function LoginLayout({ children }) {
  return (
    <div className={styles.screen}>
      <Header />
      {/* children er Log ind-siden */}
      {children}
    </div>
  );
}
