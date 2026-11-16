import { formatDay, formatPrice, formatSeats, formatTime } from "@/lib/format";

/**
 * What the user is buying: film, cinema, hall, time, seats and total.
 *
 * @param {object} props
 * @param {object} props.showtime From getShowtime()
 * @param {Array<{ id: number, row_number: number, seat_number: number }>} [props.seats]
 * @param {number} [props.totalDkk]
 */
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
