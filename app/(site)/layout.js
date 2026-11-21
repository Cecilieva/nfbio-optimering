import Footer from "@/components/features/layout/Footer";
import Header from "@/components/features/layout/Header";
import { LoadingHost } from "@/components/features/LoadingState";
import SmoothScroll from "@/components/features/layout/SmoothScroll";

// Layout for route-gruppen "(site)": alle sider undtagen Vælg by.
// Parenteserne betyder, at "(site)" IKKE kommer med i URL'en, så /film bare er /film.
// Alle disse sider får den fulde header øverst og footeren nederst – og blød scroll (Lenis).
export default function SiteLayout({ children }) {
  return (
    <>
      <SmoothScroll />
      <Header />
      {/* children er den side, der vises, fx /film */}
      {children}
      <Footer />
      {/* Loaderen: henter popkornene på forhånd og holder loaderen på skærmen i mindst 3 sekunder */}
      <LoadingHost />
    </>
  );
}
