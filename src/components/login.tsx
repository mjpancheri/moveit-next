import Head from 'next/head';
import { FormEvent, useState, useContext, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

import styles from '../styles/components/Login.module.css';

export default function Login() {
  const { loading, isInvalidUser, is403, signIn } = useAuth();
  const [login, setLogin] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    signIn(login);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Login | move.it</title>
      </Head>

      <section>
        <div>
          <img src="/icons/simbolo.svg" alt="Fundo"/>
        </div>
        <div className={styles.authenticate}>
          <header>
            <img src="/icons/logo.svg" alt="Logo"/>
          </header>

          <main>
            <strong>Bem vindo</strong>
            <p>
              <img src="/icons/github.svg" alt="Github"/>
              Faça login com seu Github para começar
            </p>
            {isInvalidUser && (
              <div className={styles.message}>
                {is403 ? 'Serviço temporariamente desabilitado, tente novamente mais tarde...' : 'Digite um usuário do Github válido!'}
              </div>
            )}
          </main>

          <footer>
            {loading ? <div className={styles.loading}><FaSpinner className={styles.spinner} /> Carregando...</div>
            : (
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                value={login} 
                placeholder="Digite seu username"
                onChange={e => (setLogin(e.target.value))} 
              />
              <button
                type="submit"
                disabled={login === ''}
              >
                <img src="/icons/vector.svg" alt="Entrar"/>
              </button>
            </form>
            )}
          </footer>
        </div>
      </section>
    </div>
  )
}