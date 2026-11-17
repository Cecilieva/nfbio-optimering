import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";

// Every page except /by: full header and footer.
export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
