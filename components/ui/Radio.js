/**
 * One radio button with its label. Group them with the same name, e.g. the payment methods.
 *
 * @param {object} props
 * @param {React.ReactNode} props.label
 * @param {string} props.name
 * @param {string} props.value
 * @param {boolean} [props.defaultChecked]
 * @param {boolean} [props.required]
 */
export default function Radio({ label, name, value, ...rest }) {
  return (
    <label>
      <input type="radio" name={name} value={value} {...rest} />
      {label}
    </label>
  );
}
