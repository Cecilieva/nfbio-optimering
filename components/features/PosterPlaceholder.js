// En boks med titlen i stedet for plakaten. Bruges af Poster
//
//   title - filmens titel
export default function PosterPlaceholder({ title }) {
  return (
    <div data-poster-placeholder aria-hidden="true">
      {title}
    </div>
  );
}
