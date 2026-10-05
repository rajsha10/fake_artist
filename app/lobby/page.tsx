"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import Image from 'next/image';
import ReusableButton from '../../components/Common/ReusableButton';
import RoleReveal from '../../components/Lobby/RoleReveal';
import GameCanvas from '../../components/Lobby/GameCanvas';
import styles from './Lobby.module.css';

// Load the custom crayon font
const crayonsFont = localFont({ 
  src: '../../public/fonts/CfCrayonsRegular-2Gl3.ttf',
  variable: '--font-crayons'
});

const ColorfulText = ({ text }: { text: string }) => {
  const colors = ['#ff6b6b', '#a3ff70', '#ff9ff3', '#4ecdc4', '#ffe66d', '#cd84f1'];
  
  return (
    <div className={styles.titleWord}>
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          className={styles.titleLetter}
          style={{ color: colors[index % colors.length] }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

function LobbyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get('code') || 'K9X2';
  const playerName = searchParams.get('name') || 'Guest';

  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [phase, setPhase] = useState<string>('LOBBY');
  const [roleInfo, setRoleInfo] = useState<{ role: string; category: string; word: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const isCurrentUserHost = activePlayers.find((p) => p.name === playerName)?.isHost || false;
  const canStartGame = activePlayers.length >= 3;

  useEffect(() => {
    // Connect to WebSocket server running on port 8080
    const wsUrl = `ws://${window.location.hostname}:8080`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      // Join room upon connection
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: roomCode,
        name: playerName
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'STATE_UPDATE' && msg.state) {
          if (msg.state.phase) {
            setPhase(msg.state.phase);
          }
          
          if (msg.state.players) {
            // Map server players to our avatar display list
            const updatedPlayers = msg.state.players.map((p: any, index: number) => ({
              id: p.id,
              name: p.name,
              // Cycle through our 10 generated avatars based on index
              avatar: `/assets/Profiles/avatar_${(index % 10) + 1}.jpg`,
              isHost: p.isHost
            }));
            setActivePlayers(updatedPlayers);
          }
        } else if (msg.type === 'ROLE_ASSIGNED') {
          setRoleInfo({
            role: msg.role,
            category: msg.category,
            word: msg.word
          });
        } else if (msg.type === 'TIME_TICK') {
          setTimeLeft(msg.timeLeft);
        } else if (msg.type === 'ERROR') {
          console.error('Server error:', msg.message);
          alert(`Error: ${msg.message}`);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.onerror = (error) => {
      console.warn('WebSocket encountered an issue (may be due to Strict Mode fast-refresh):', error);
    };

    return () => {
      ws.close();
    };
  }, [roomCode, playerName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room code copied!');
  };

  const handleStartGame = () => {
    if (!canStartGame) {
      alert('Need at least 3 players to start!');
      return;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'START_GAME',
        category: 'Animals', // Default for now, could be dynamic later
        word: 'Cat'          // Default for now, could be dynamic later
      }));
    } else {
      alert('WebSocket is not connected!');
    }
  };

  const handleExit = () => {
    router.push('/');
  };

  // 1. Render DRAWING Phase (Canvas UI)
  if (phase.startsWith('DRAWING')) {
    return (
      <main className={`${crayonsFont.className} ${styles.container}`} style={{ justifyContent: 'center' }}>
        <GameCanvas ws={wsRef.current} phase={phase} />
      </main>
    );
  }

  // 2. Render ROLE REVEAL Phase
  if (phase === 'ROLE_REVEAL') {
    return (
      <main className={`${crayonsFont.className} ${styles.container}`} style={{ justifyContent: 'center' }}>
        <RoleReveal roleInfo={roleInfo} timeLeft={timeLeft} />
      </main>
    );
  }

  // 3. Render LOBBY Phase
  return (
    <main className={`${crayonsFont.className} ${styles.container}`}>
      {/* Exit Button */}
      <button onClick={handleExit} className={styles.exitButton} title="Leave Room">
        <svg viewBox="0 0 24 24" className={styles.exitIcon}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        EXIT
      </button>

      {/* Header section with room code */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <ColorfulText text="Room" />
          <ColorfulText text="Code:" />
          <ColorfulText text={roomCode} />
          
          <button onClick={handleCopy} className={styles.copyButton} title="Copy Room Code">
            <svg viewBox="0 0 24 24" className={styles.copyIcon}>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </button>
        </div>
      </header>

      {/* Middle section with player avatars */}
      <section className={styles.avatarContainer}>
        {activePlayers.length === 0 && <div>Waiting for players...</div>}
        {activePlayers.map((player, index) => (
          <div key={player.id} className={styles.avatarSlot}>
            <div className={`${styles.avatarImageWrapper} ${styles[`border${index % 6}`]}`}>
              <Image 
                src={player.avatar} 
                alt={player.name}
                fill
                className={styles.avatarImg}
                unoptimized
              />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{player.name}</div>
            {player.isHost && (
              <div className={styles.hostBadge}>
                👑 Host
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Bottom section with start button (only for host) */}
      <footer>
        {isCurrentUserHost ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <ReusableButton 
              onClick={handleStartGame} 
              disabled={!canStartGame}
              style={{ opacity: canStartGame ? 1 : 0.5, cursor: canStartGame ? 'pointer' : 'not-allowed' }}
            >
              START GAME
            </ReusableButton>
            {!canStartGame && <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Waiting for at least 3 players...</p>}
          </div>
        ) : (
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px 20px', borderRadius: '12px', border: '3px solid black' }}>
            Waiting for host to start the game...
          </div>
        )}
      </footer>
    </main>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<div>Loading Lobby...</div>}>
      <LobbyContent />
    </Suspense>
  );
}
