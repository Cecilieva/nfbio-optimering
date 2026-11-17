import Header from "@/components/features/Header";
import styles from "./page.module.css";

// Figma "01 Vælg by": logo-only header, no footer. Wraps / and /by.
export default function CityLayout({ children }) {
  return (
    <div className={styles.screen}>
      <Header variant="logo" />
      {children}
    </div>
  );
}
