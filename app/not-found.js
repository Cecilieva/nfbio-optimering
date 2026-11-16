import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Siden blev ikke fundet</h1>
      <p>Vi kunne ikke finde det, du ledte efter.</p>
      <p>
        <Link href="/">Gå til forsiden</Link>
      </p>
    </main>
  );
}
