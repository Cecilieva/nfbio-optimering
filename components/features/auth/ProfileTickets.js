import Ticket from "@/components/features/ticket/Ticket";
import ProfileCard from "./ProfileCard";
import styles from "./ProfileTickets.module.css";

// "Mine billetter": billetterne på en række, man kan scrolle i
export default function ProfileTickets({ tickets }) {
  return (
    <ProfileCard title="Mine billetter">
      {tickets.length === 0 ? (
        <p className={styles.empty}>Du har ingen billetter endnu.</p>
      ) : (
        // tabIndex: så man også kan scrolle med tastaturet
        <ul className={styles.list} tabIndex={0} aria-label="Mine billetter">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Ticket showtime={ticket.showtime} seats={ticket.seats} />
            </li>
          ))}
        </ul>
      )}
    </ProfileCard>
  );
}
