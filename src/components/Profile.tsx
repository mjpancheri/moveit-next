import { FormEvent, useContext } from 'react';
import { FaSignOutAlt, FaUserAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useChallenges } from '../contexts/ChallengesContext';
import styles from '../styles/components/Profile.module.css';

export function Profile() {
  const { level } = useChallenges();
  const { user, signOut } = useAuth();

  function handleLogout(event: FormEvent) {
    event.preventDefault();

    signOut();
  }

  return (
    <div className={styles.profileContainer}>
      {user.picture !== '' ? <img src={user.picture} alt={user.name || 'Sem nome'} /> : <FaUserAlt size={72} />}
      <div>
        <a href={user.url} target="_blank"><strong>{user.name || 'Sem nome'}</strong></a>
        <p>
          <img src="icons/level.svg" alt="Level"/>
          Level {level}
        </p>
        <button 
          className={styles.logout}
          onClick={handleLogout}
        >
          {/* <img src="icons/vector2.svg" alt="Sair"/> */}
          <FaSignOutAlt size={20} color="var(--white)" />
        </button>
      </div>
    </div>
  )
}
