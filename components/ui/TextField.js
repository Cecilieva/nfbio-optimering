/**
 * A label and an input, with an optional error under it.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.name Also used as id
 * @param {string} [props.type="text"]
 * @param {string} [props.error] Shown under the field and linked with aria-describedby
 */
export default function TextField({ label, name, type = "text", error, ...rest }) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div data-field>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
