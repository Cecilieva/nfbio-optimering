import Link from "next/link";

/**
 * A button, or a link that looks like one when it gets href.
 * Unstyled: the look comes from Figma. data-variant is there to style on.
 *
 * @param {object} props
 * @param {"primary" | "secondary" | "ghost"} [props.variant="primary"]
 * @param {string} [props.href] Renders a Link instead of a <button>
 * @param {"button" | "submit"} [props.type="button"]
 * @param {boolean} [props.disabled]
 * @param {React.ReactNode} props.children
 */
export default function Button({ variant = "primary", href, type = "button", children, ...rest }) {
  if (href) {
    return (
      <Link href={href} data-variant={variant} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} data-variant={variant} {...rest}>
      {children}
    </button>
  );
}
