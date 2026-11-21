import styles from "./UserBadge.module.css";

// The user's first letter and name. full_name can be empty, so we fall back to the email.
export default function UserBadge({ profile }) {
  const name = profile.full_name || profile.email;

  return (
    <div className={styles.badge}>
      <span className={styles.avatar} aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <p className={styles.name}>{name}</p>
    </div>
  );
}
