import React from 'react';
import styles from './GameOverScreen.module.css';
import ReusableButton from '../Common/ReusableButton';

interface GameOverScreenProps {
  ws: WebSocket | null;
  isHost: boolean;
  gameResult: { winner: string; secretWord: string; reason: string } | null;
  players: any[];
}

export default function GameOverScreen({ ws, isHost, gameResult, players }: GameOverScreenProps) {
  const handlePlayAgain = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'START_GAME' }));
    }
  };

  const handleToLobby = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'RESTART_GAME' }));
    }
  };

  if (!gameResult) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const isRealArtistsWin = gameResult.winner === 'REAL_ARTISTS';

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Simple text confetti for flair */}
        <div className={styles.confetti1}>⭐️</div>
        <div className={styles.confetti2}>🎉</div>
        <div className={styles.confetti3}>✨</div>
        <div className={styles.confetti4}>🎊</div>

        <div className={`${styles.crayonBanner} ${isRealArtistsWin ? styles.greenBanner : styles.redBanner}`}>
          {isRealArtistsWin ? 'Real Artists Win!' : 'Fake Artist Wins!'}
        </div>

        <div className={styles.secretWordSection}>
          <p>The secret word was:</p>
          <div className={styles.highlightedWord}>
            {gameResult.secretWord.toUpperCase()}
          </div>
        </div>

        <p className={styles.reasonText}>{gameResult.reason}</p>

        {isHost ? (
          <div className={styles.buttonContainer} style={{ display: 'flex', gap: '15px' }}>
            <ReusableButton onClick={handlePlayAgain}>
              PLAY AGAIN
            </ReusableButton>
            <ReusableButton 
              onClick={handleToLobby}
              style={{ backgroundColor: '#ff7675', color: '#000' }}
            >
              TO LOBBY
            </ReusableButton>
          </div>
        ) : (
          <div className={styles.waitingText}>
            Waiting for host...
          </div>
        )}
      </div>
    </div>
  );
}
