/**
 * Empty state for a film without poster_url: a box with the title.
 *
 * @param {object} props
 * @param {string} props.title
 */
export default function PosterPlaceholder({ title }) {
  return (
    <div data-poster-placeholder aria-hidden="true">
      {title}
    </div>
  );
}
