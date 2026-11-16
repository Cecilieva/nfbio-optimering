/**
 * A small toggle, e.g. a genre or the number of tickets.
 *
 * @param {object} props
 * @param {boolean} [props.selected] Shown with aria-pressed
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {React.ReactNode} props.children
 */
export default function Chip({ selected = false, children, ...rest }) {
  return (
    <button type="button" aria-pressed={selected} data-selected={selected} {...rest}>
      {children}
    </button>
  );
}
