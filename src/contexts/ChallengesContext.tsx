import { createContext, ReactNode, useEffect, useState } from 'react';
import challenges from '../../challenges.json';

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
}

interface ChallengesProviderProps {
  children: ReactNode;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ children }: ChallengesProviderProps) {
  const [level, setLevel] = useState(1);
  const [currentExperience, setCurrentExperience] = useState(0);
  const [challengesCompleted, setChallengesCompleted] = useState(0);

  const [activeChallenge, setActiveChallenge] = useState(null);

  const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

  useEffect(() => {
    Notification.requestPermission();

    if(localStorage.getItem('moveit.level')) {
      setLevel(parseInt(localStorage.getItem('moveit.level'), 10));
    }
    if(localStorage.getItem('moveit.currentExperience')) {
      setCurrentExperience(parseInt(localStorage.getItem('moveit.currentExperience'), 10));
    }
    if(localStorage.getItem('moveit.challengesCompleted')) {
      setChallengesCompleted(parseInt(localStorage.getItem('moveit.challengesCompleted'), 10));
    }
  }, [])
  
  function levelUp() {
    setLevel(level + 1);
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
    let finalLevel = level;
    let finalChallengesCompleted = challengesCompleted + 1;
    if (finalExperience >= experienceToNextLevel) {
      finalExperience = finalExperience - experienceToNextLevel;
      levelUp();
      finalLevel++;
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(finalChallengesCompleted);

    localStorage.setItem('moveit.level', String(finalLevel));
    localStorage.setItem('moveit.currentExperience', String(finalExperience));
    localStorage.setItem('moveit.challengesCompleted', String(finalChallengesCompleted));
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
    }}>
      {children}
    </ChallengesContext.Provider>
  )
}