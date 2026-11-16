/**
 * Shown by loading.js while a page fetches data.
 *
 * @param {object} props
 * @param {string} [props.label="Henter …"]
 */
export default function LoadingState({ label = "Henter …" }) {
  return (
    <main>
      <p role="status">{label}</p>
    </main>
  );
}
