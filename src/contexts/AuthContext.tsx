import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Toast } from '../components/Toast';

interface User {
  id: number;
  login: string;
  name: string;
  url: string;
  picture: string;
  level?: number; 
  currentExperience?: number; 
  challengesCompleted?: number; 
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  message: string;
  isInvalidUser: boolean;
  is403: boolean;
  signIn: (login: string) => void;
  signOut: () => void;
  setMsg: (msg: string) => void;
}

interface AuthProviderProps {
  children: ReactNode;
  loginGithub: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({children, ...others}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInvalidUser, setIsInvalidUser] = useState(false);
  const [is403, setIs403] = useState(false);
  const [ message, setMessage ] = useState('');

  useEffect(() => {
    if(others.loginGithub !== '') {
      axios.post('api/user', { login: others.loginGithub })
        .then(response => {
          if(response.data.user) {
            const user = response.data.user;
            setUser(user);
            setCookies(user);
            setLoading(false);
            setMsg(`Bem-vindo novamente, ${user.name}!`);
          }
        })
        .catch(err => {
          setMsg(err);
        })
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setMessage('');
    }, 3000);
  }, [message]);

  function signIn(login: string) {
    setLoading(true);
    axios.post('api/user', { login })
    .then(response => {
      if(response.data.user) {
        const user = response.data.user;
        setUser(user);
        setCookies(user);
        setLoading(false);
        setMsg(`Bem-vindo, ${user.name}!`);
      }
    })
    .catch(error => {
      axios.get(`https://api.github.com/users/${login}`)
      .then(response => {
        if(response.data.login) {
          const githubUser = response.data;
          const foto = githubUser.avatar_url || '';
          axios.post('api/user/new', { login: githubUser.login, name: githubUser.name, url: githubUser.html_url, picture: foto })
            .then(response => {
              if(response.data.id) {
                const newUser = {id: response.data.id, login: githubUser.login, name: githubUser.name, url: githubUser.html_url, picture: foto, level: 1, currentExperience: 0, challengesCompleted: 0};
                setUser(newUser);
                setCookies(newUser);
                setLoading(false);
                setMsg(`Seja bem-vindo, ${githubUser.name}!`);
              }
            })
            .catch(err => {
              setIsInvalidUser(true);
              setLoading(false);
              setMsg(err);
            })
        } else {
          setIsInvalidUser(true);
          setLoading(false);
        }
      })
      .catch(error => {
        if(String(error).indexOf('403') > 0) {
          setIs403(true);
        }
        setIsInvalidUser(true);
        setLoading(false);
      });
    });
  }

  function signOut() {
    Cookies.remove('loginGithub');
    Cookies.remove('level');
    Cookies.remove('currentExperience');
    Cookies.remove('challengesCompleted');
    setUser(null);
  }

  function setCookies(user: User) {
    Cookies.set('loginGithub', user.login);
    // Cookies.set('idUser', String(user.id));
    // Cookies.set('login', String(user.login));
    Cookies.set('level', String(user.level));
    Cookies.set('currentExperience', String(user.currentExperience));
    Cookies.set('challengesCompleted', String(user.challengesCompleted));
  }

  function setMsg(msg: string) {
    setMessage(msg);
  }

  return (
    <AuthContext.Provider
      value={{signed: !!user, user, loading, message, isInvalidUser, is403, signIn, signOut, setMsg}}>
      {children}
      {message && <Toast />}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
