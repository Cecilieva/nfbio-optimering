/**
 * Placeholder: shows the data a page has as JSON, until the Figma design replaces it.
 * Remove it from a page when the screen is built.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {unknown} props.data
 */
export default function DataDump({ label, data }) {
  return (
    <details>
      <summary>Data: {label}</summary>
      <pre className="data-dump">{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}
