import Head from 'next/head';
import { GetServerSideProps } from 'next';

import { CompletedChallenges } from "../components/CompletedChallenges";
import { CountDown } from "../components/CountDown";
import { ExperienceBar } from "../components/ExperienceBar";
import { ChallengeBox } from "../components/ChallengeBox";
import { Profile } from "../components/Profile";

import { AuthProvider } from '../contexts/AuthContext';
import { ChallengesProvider } from '../contexts/ChallengesContext';
import { CountdownProvider } from '../contexts/CountdownContext';

import styles from '../styles/pages/Home.module.css';

interface HomeProps {
  loginGithub: string;
  level: number;
  currentExperience: number;
  challengesCompleted: number;
}

export default function Home(props: HomeProps) {
  return (
    <AuthProvider loginGithub={props.loginGithub}>
      <ChallengesProvider
        level={props.level}
        currentExperience={props.currentExperience}
        challengesCompleted={props.challengesCompleted}
      >
        <div className={styles.container}>
          <Head>
            <title>Inicio | move.it</title>
          </Head>

          <ExperienceBar />
          <CountdownProvider>
            <section>
              <div>
                <Profile />
                <CompletedChallenges />
                <CountDown />
              </div>
              <div>
                <ChallengeBox />
              </div>
            </section>
            </CountdownProvider>
        </div>
      </ChallengesProvider>
    </AuthProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { loginGithub, level, currentExperience, challengesCompleted } = ctx.req.cookies;

  return {
    props: {
      loginGithub: (loginGithub || ''),
      level: Number(level || 1),
      currentExperience: Number(currentExperience || 0),
      challengesCompleted: Number(challengesCompleted || 0),
    }
  }
}