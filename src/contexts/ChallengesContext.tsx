import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';
import Login from '../components/login';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie';

interface Challenge {
  type: 'body' | 'eye';
  description: string;
  amount: number;
}

interface ChallengesContextData {
  level: number;
  currentExperience: number;
  challengesCompleted: number;
  experienceToNextLevel: number;
  activeChallenge: Challenge;
  levelUp: () => void;
  startNewChallenge: () => void;
  resetChallenge: () => void;
  completeChallenge: () => void;
  closeLevelUpModal: () => void;
}

interface ChallengesProviderProps {
  children: ReactNode;
  level: number; 
  currentExperience: number; 
  challengesCompleted: number; 
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ children, ...others }: ChallengesProviderProps) {
  const { signed, user, setMsg } = useAuth();
  const [level, setLevel] = useState(others.level);
  const [currentExperience, setCurrentExperience] = useState(others.currentExperience);
  const [challengesCompleted, setChallengesCompleted] = useState(others.challengesCompleted);

  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);

  const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

  useEffect(() => {
    Notification.requestPermission();
  }, [])

  useEffect(() => {
    Cookies.set('level', String(level));
    Cookies.set('currentExperience', String(currentExperience));
    Cookies.set('challengesCompleted', String(challengesCompleted));

    if(user) {
      axios.post('api/user/update', { 
        login: user.login,
        level: level,
        currentExperience: currentExperience,
        challengesCompleted: challengesCompleted
      })
      .then(response => {
        setMsg('Usuário atualizado...');
      })
      .catch(error => {
        setMsg(error);
      });
    }
  }, [level, currentExperience, challengesCompleted])
  
  function levelUp() {
    setLevel(level + 1);
    setIsLevelUpModalOpen(true);
  }

  function closeLevelUpModal() {
    setIsLevelUpModalOpen(false);
  }

  function startNewChallenge() {
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const challenge = challenges[randomChallengeIndex];

    setActiveChallenge(challenge);

    new Audio('/notification.mp3').play();

    if(Notification.permission === 'granted') {
      new Notification('Novo desafio ;)', {
        body: `Valendo ${challenge.amount} xp!`
      });
    }
  }

  function resetChallenge() {
    setActiveChallenge(null);
  }

  function completeChallenge() {
    if (!activeChallenge) {
      return;
    }
    
    const { amount } = activeChallenge;

    let finalExperience = currentExperience + amount;
    if (finalExperience >= experienceToNextLevel) {
      finalExperience = finalExperience - experienceToNextLevel;
      levelUp();
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(challengesCompleted + 1);
  }

  return (
    <ChallengesContext.Provider value={{ 
      level, 
      currentExperience, 
      challengesCompleted, 
      experienceToNextLevel,
      activeChallenge,
      levelUp,
      startNewChallenge,
      resetChallenge,
      completeChallenge,
      closeLevelUpModal,
    }}>
      {signed ? children : <Login />}
      {isLevelUpModalOpen && <LevelUpModal />}
    </ChallengesContext.Provider>
  )
}

export function useChallenges() {
  const context = useContext(ChallengesContext);

  return context;
}
