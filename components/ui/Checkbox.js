import styles from "./Checkbox.module.css";

/**
 * En checkbox med sit label, fx "Husk mig" eller "Accepter handelsbetingelserne".
 * Figma: "Checkbox" (blå kant) og "Flueben" (når den er krydset af).
 *
 * @param {object} props
 * @param {React.ReactNode} props.label
 * @param {string} props.name
 * @param {boolean} [props.defaultChecked]
 * @param {boolean} [props.required]
 * @param {string} [props.className] Ekstra CSS-klasse fra forælderen
 */
export default function Checkbox({ label, name, className, ...rest }) {
  const classes = className ? `${styles.checkbox} ${className}` : styles.checkbox;

  // Inputtet ligger inde i <label>, så et klik på teksten også krydser af
  return (
    <label className={classes}>
      <input type="checkbox" name={name} className={styles.input} {...rest} />
      <span>{label}</span>
    </label>
  );
}
