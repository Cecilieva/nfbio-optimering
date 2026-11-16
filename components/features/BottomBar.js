import styles from "./BottomBar.module.css";

/**
 * Sticks to the bottom of the screen in the booking flow: summary on the left, action on the right.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.summary] E.g. "2 billetter · 270 kr."
 * @param {React.ReactNode} props.children The action, e.g. a submit Button
 */
export default function BottomBar({ summary, children }) {
  return (
    <div className={styles.bar}>
      <div>{summary}</div>
      <div>{children}</div>
    </div>
  );
}
