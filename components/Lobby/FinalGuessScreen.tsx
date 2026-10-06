import React, { useState } from 'react';
import styles from './FinalGuessScreen.module.css';

interface FinalGuessScreenProps {
  ws: WebSocket | null;
  myPlayerId: string;
  accusedPlayerId: string | null;
  timeLeft: number | null;
  roleInfo: { role: string; category: string; word: string } | null;
}

export default function FinalGuessScreen({ ws, myPlayerId, accusedPlayerId, timeLeft, roleInfo }: FinalGuessScreenProps) {
  const [guessInputText, setGuessInputText] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);

  const isFakeArtist = myPlayerId === accusedPlayerId;

  const handleGuessSubmit = () => {
    if (!guessInputText.trim() || hasGuessed) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'SUBMIT_FINAL_GUESS',
          guess: guessInputText,
        })
      );
      setHasGuessed(true);
    }
  };

  const formatTime = (time: number | null) => {
    if (time === null) return "0:00";
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Decorative elements */}
        <div className={`${styles.decoration} ${styles.dec1}`}>❓</div>
        <div className={`${styles.decoration} ${styles.dec2}`}>⭐</div>
        <div className={`${styles.decoration} ${styles.dec3}`}>⭐</div>

        <div className={styles.timer}>{formatTime(timeLeft)}</div>

        {isFakeArtist ? (
          <>
            <div className={styles.titleContainer}>
              <div className={styles.titleHighlight}></div>
              <h2 className={styles.title}>You were caught!</h2>
            </div>
            
            <p className={styles.subtitle}>
              Guess the <span className={styles.secretWordText}>Secret Word</span> to steal the win!
            </p>

            <input 
              type="text" 
              className={styles.guessInput}
              placeholder="Type your guess..."
              value={guessInputText}
              onChange={(e) => setGuessInputText(e.target.value)}
              disabled={hasGuessed}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGuessSubmit();
                }
              }}
            />

            <button 
              className={styles.guessBtn} 
              onClick={handleGuessSubmit}
              disabled={!guessInputText.trim() || hasGuessed}
            >
              {hasGuessed ? 'GUESSED' : 'GUESS!'}
            </button>
          </>
        ) : (
          <>
            <div className={styles.titleContainer}>
              <div className={styles.titleHighlightSuccess}></div>
              <h2 className={styles.title}>You caught them!</h2>
            </div>
            
            <p className={styles.subtitle}>
              The Fake Artist is now guessing the word...
            </p>

            <div className={styles.waitingIcon}>⏳</div>
          </>
        )}
      </div>
    </div>
  );
}
