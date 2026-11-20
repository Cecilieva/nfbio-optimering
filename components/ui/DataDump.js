// Pladsholder: viser sidens data som rå tekst (JSON), indtil skærmen er bygget.
// Fjern den fra siden, når skærmen er færdig.
//
//   label - en overskrift over dataene
//   data  - dataene, der skal vises
export default function DataDump({ label, data }) {
  return (
    <details>
      <summary>Data: {label}</summary>
      <pre className="data-dump">{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}
