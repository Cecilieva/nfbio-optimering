// Vises af loading.js, mens en side henter data.
//
//   label - teksten, der vises (standard: "Henter …")
export default function LoadingState({ label = "Henter …" }) {
  return (
    <main>
      <p role="status">{label}</p>
    </main>
  );
}
