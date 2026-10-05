import React from 'react';
import styles from './RoleReveal.module.css';

interface RoleRevealProps {
  roleInfo: { role: string; category: string; word: string } | null;
  timeLeft: number | null;
}

export default function RoleReveal({ roleInfo, timeLeft }: RoleRevealProps) {
  if (!roleInfo) return <div className={styles.revealContainer}>Loading your secret role...</div>;

  const isFake = roleInfo.role === 'FAKE_ARTIST';

  return (
    <div className={styles.revealContainer}>
      <h2 className={styles.title}>
        You are {isFake ? 'the Fake Artist!' : 'a Real Artist!'}
      </h2>
      
      <div className={styles.infoBox}>
        {isFake ? (
          <>
            <p>The category is: <br/><span className={styles.highlight}>{roleInfo.category}</span></p>
            <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Try to blend in!</p>
          </>
        ) : (
          <>
            <p>The word is: <br/><span className={styles.highlight}>{roleInfo.word}</span></p>
            <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>(Category: {roleInfo.category})</p>
          </>
        )}
      </div>

      <div>
        <p style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Game starts in:</p>
        <div className={styles.countdown}>{timeLeft !== null ? timeLeft : '...'}</div>
      </div>
    </div>
  );
}
