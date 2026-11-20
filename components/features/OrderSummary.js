import { formatDay, formatPrice, formatSeats, formatTime } from "@/lib/format";

// Det, man er ved at købe: film, biograf, sal, tid, sæder og pris i alt.
//
//   showtime - forestillingen fra getShowtime()
//   seats    - de valgte sæder (vises kun, hvis der er nogen)
//   totalDkk - prisen i alt (vises kun, hvis den er med)
export default function OrderSummary({ showtime, seats = [], totalDkk }) {
  return (
    <dl>
      <dt>Film</dt>
      <dd>{showtime.movie.title}</dd>
      <dt>Biograf</dt>
      <dd>
        {showtime.hall.cinema.name}, {showtime.hall.name}
      </dd>
      <dt>Tid</dt>
      <dd>
        {formatDay(showtime.starts_at)} kl. {formatTime(showtime.starts_at)} · {showtime.format}
      </dd>
      {seats.length > 0 && (
        <>
          <dt>Sæder</dt>
          <dd>{formatSeats(seats)}</dd>
        </>
      )}
      {totalDkk != null && (
        <>
          <dt>I alt</dt>
          <dd>{formatPrice(totalDkk)}</dd>
        </>
      )}
    </dl>
  );
}
