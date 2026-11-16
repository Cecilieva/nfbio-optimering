/**
 * A checkbox with its label, e.g. "Accepter handelsbetingelserne".
 *
 * @param {object} props
 * @param {React.ReactNode} props.label
 * @param {string} props.name
 * @param {boolean} [props.defaultChecked]
 * @param {boolean} [props.required]
 */
export default function Checkbox({ label, name, ...rest }) {
  return (
    <label>
      <input type="checkbox" name={name} {...rest} />
      {label}
    </label>
  );
}
