// Én radioknap med sin tekst. Knapper med samme name hører sammen, fx betalingsmetoderne.
//
//   label          - teksten ved knappen
//   name           - gruppens navn
//   value          - værdien, der sendes, når knappen er valgt
//   defaultChecked - valgt fra start
//   required       - man skal vælge en i gruppen
export default function Radio({ label, name, value, ...rest }) {
  return (
    <label>
      <input type="radio" name={name} value={value} {...rest} />
      {label}
    </label>
  );
}
