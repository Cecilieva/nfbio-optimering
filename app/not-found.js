import Link from "next/link";
import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";

// Lives at the root, outside app/(site), so it renders the header and footer itself.
export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <h1>Siden blev ikke fundet</h1>
        <p>Vi kunne ikke finde det, du ledte efter.</p>
        <p>
          <Link href="/">Gå til forsiden</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
