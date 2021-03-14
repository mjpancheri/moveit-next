import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/Toast.module.css';

export function Toast() {
  const { message } = useAuth();

  return (
    <>
    {message && (
      <div className={styles.container}>
          {message}
      </div>
    )}
    </>
  )
}