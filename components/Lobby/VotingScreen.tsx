import React, { useState } from 'react';
import Image from 'next/image';
import styles from './VotingScreen.module.css';

interface VotingScreenProps {
  ws: WebSocket | null;
  players: any[];
  myPlayerId: string;
  timeLeft: number | null;
}

export default function VotingScreen({ ws, players, myPlayerId, timeLeft }: VotingScreenProps) {
  const [selectedVotedId, setSelectedVotedId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (!selectedVotedId || hasVoted) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'SUBMIT_VOTE',
          suspectId: selectedVotedId,
        })
      );
      setHasVoted(true);
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
        {/* Decorative sketchy elements around the modal */}
        <div className={`${styles.decoration} ${styles.dec1}`}>❓</div>
        <div className={`${styles.decoration} ${styles.dec2}`}>⭐</div>
        <div className={`${styles.decoration} ${styles.dec3}`}>⭐</div>
        <div className={`${styles.decoration} ${styles.dec4}`}>⤵️</div>

        <div className={styles.titleContainer}>
          <div className={styles.titleHighlight}></div>
          <h2 className={styles.title}>Who is the Fake Artist?</h2>
        </div>

        <div className={styles.timer}>{formatTime(timeLeft)}</div>

        <div className={styles.grid}>
          {players.map((p) => {
            const isSelected = selectedVotedId === p.id;
            return (
              <div
                key={p.id}
                className={`${styles.avatarSlot} ${isSelected ? styles.selected : ''}`}
                style={{ 
                  borderColor: p.color || '#000',
                  boxShadow: isSelected ? `0 0 15px ${p.color || '#ff5252'}` : 'none'
                }}
                onClick={() => !hasVoted && setSelectedVotedId(p.id)}
              >
                <Image
                  src={p.avatar}
                  alt={p.name}
                  width={75}
                  height={75}
                  className={styles.avatarImg}
                  unoptimized
                />
                {p.isHost && <div className={styles.hostBadge}>Host</div>}
              </div>
            );
          })}
        </div>

        <button 
          className={styles.voteBtn} 
          onClick={handleVote}
          disabled={!selectedVotedId || hasVoted}
        >
          {hasVoted ? 'VOTED' : 'VOTE'}
        </button>
      </div>
    </div>
  );
}
