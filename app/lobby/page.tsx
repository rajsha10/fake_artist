"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import Image from 'next/image';
import ReusableButton from '../../components/Common/ReusableButton';
import RoleReveal from '../../components/Lobby/RoleReveal';
import GameCanvas from '../../components/Lobby/GameCanvas';
import VotingScreen from '../../components/Lobby/VotingScreen';
import FinalGuessScreen from '../../components/Lobby/FinalGuessScreen';
import GameOverScreen from '../../components/Game/GameOverScreen';
import type { RoomSettings } from '@/types/game';
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
  const maxPlayersParam = searchParams.get('maxPlayers');
  const maxPlayers = maxPlayersParam ? parseInt(maxPlayersParam, 10) : undefined;

  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [roomMaxPlayers, setRoomMaxPlayers] = useState<number>(10);
  const [phase, setPhase] = useState<string>('LOBBY');
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [roleInfo, setRoleInfo] = useState<{ role: string; category: string; word: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [votingResults, setVotingResults] = useState<{ votes: Record<string, string[]>, fakeArtistCaught: boolean } | null>(null);
  const [accusedPlayerId, setAccusedPlayerId] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{ winner: string; secretWord: string; reason: string } | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
    drawingTime: 20,
    votingTime: 10,
    roleRevealTime: 8,
    finalGuessTime: 25,
    category: 'Random',
  });

  const AVATAR_OPTIONS = Array.from({length: 10}, (_, i) => `/assets/Profiles/avatar_${i + 1}.jpg`);

  const wsRef = useRef<WebSocket | null>(null);

  const myPlayer = activePlayers.find((p) => p.name === playerName);
  const myPlayerId = myPlayer?.id || '';
  const isCurrentUserHost = myPlayer?.isHost || false;
  const canStartGame = activePlayers.length >= 3;

  useEffect(() => {
    // Use environment variable for production, fallback to local dev server
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8080`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const handleOpen = () => {
      console.log('Connected to WebSocket server');
      // Join room upon connection
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: roomCode,
        name: playerName,
        maxPlayers
      }));
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'STATE_UPDATE' && msg.state) {
          if (msg.state.phase) {
            setPhase(msg.state.phase);
          }
          if (msg.state.activePlayerId !== undefined) {
            setActivePlayerId(msg.state.activePlayerId);
          }
          if (msg.state.accusedPlayerId !== undefined) {
            setAccusedPlayerId(msg.state.accusedPlayerId);
          }
          if (msg.state.maxPlayers !== undefined) {
            setRoomMaxPlayers(msg.state.maxPlayers);
          }
          if (msg.state.settings) {
            setRoomSettings(msg.state.settings);
          }
          if (msg.state.players) {
            // Map server players to our avatar display list
            const updatedPlayers = msg.state.players.map((p: any, index: number) => ({
              id: p.id,
              name: p.name,
              color: p.color,
              avatar: p.avatar,
              isHost: p.isHost,
              score: p.score
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
        } else if (msg.type === 'VOTING_RESULT') {
          setVotingResults({
            votes: msg.votes,
            fakeArtistCaught: msg.fakeArtistCaught
          });
        } else if (msg.type === 'GAME_RESULT') {
          setGameResult({
            winner: msg.winner,
            secretWord: msg.secretWord,
            reason: msg.reason
          });
        } else if (msg.type === 'ERROR') {
          console.error('Server error:', msg.message);
          alert(`Error: ${msg.message}`);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    const handleError = (error: Event) => {
      console.warn('WebSocket encountered an issue (may be due to Strict Mode fast-refresh):', error);
    };

    ws.addEventListener('open', handleOpen);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('error', handleError);

    return () => {
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('message', handleMessage);
      ws.removeEventListener('error', handleError);
      ws.close();
    };
  }, [roomCode, playerName, maxPlayers]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room code copied!');
  };

  const handleLocalSettingChange = (newSetting: Partial<RoomSettings>) => {
    setRoomSettings((prev) => ({ ...prev, ...newSetting }));
  };

  const commitSettingsUpdate = (newSetting: Partial<RoomSettings>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UPDATE_SETTINGS',
        settings: newSetting,
      }));
    }
  };

  const handleUpdateSetting = (newSetting: Partial<RoomSettings>) => {
    handleLocalSettingChange(newSetting);
    commitSettingsUpdate(newSetting);
  };

  const handleStartGame = () => {
    if (!canStartGame) {
      alert('Need at least 3 players to start!');
      return;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'START_GAME',
      }));
    } else {
      alert('WebSocket is not connected!');
    }
  };

  const handleExit = () => {
    router.push('/');
  };

  // 1. Render DRAWING Phase (Canvas UI) and VOTING Phase
  if (phase.startsWith('DRAWING') || phase === 'VOTING') {
    return (
      <main className={`${crayonsFont.className} ${styles.container}`} style={{ justifyContent: 'center' }}>
        <GameCanvas 
          ws={wsRef.current} 
          phase={phase}
          myPlayerId={myPlayerId}
          activePlayerId={activePlayerId}
          timeLeft={timeLeft}
          players={activePlayers}
          roleInfo={roleInfo}
        />
        {phase === 'VOTING' && (
          <VotingScreen 
            ws={wsRef.current} 
            players={activePlayers}
            myPlayerId={myPlayerId}
            timeLeft={timeLeft}
          />
        )}
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

  // Render FINAL GUESS Phase
  if (phase === 'FINAL_GUESS') {
    return (
      <main className={`${crayonsFont.className} ${styles.container}`} style={{ justifyContent: 'center' }}>
        <FinalGuessScreen 
          ws={wsRef.current} 
          myPlayerId={myPlayerId}
          accusedPlayerId={accusedPlayerId}
          timeLeft={timeLeft}
          roleInfo={roleInfo}
        />
      </main>
    );
  }

  // Render GAME OVER Phase
  if (phase === 'GAME_OVER') {
    return (
      <main className={`${crayonsFont.className} ${styles.container}`} style={{ justifyContent: 'center' }}>
        <GameOverScreen 
          ws={wsRef.current} 
          isHost={isCurrentUserHost}
          gameResult={gameResult}
          players={activePlayers}
        />
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
            <div 
              className={`${styles.avatarImageWrapper} ${styles[`border${index % 6}`]}`}
              style={player.id === myPlayerId ? { cursor: 'pointer' } : {}}
              onClick={() => {
                if (player.id === myPlayerId) {
                  setIsAvatarModalOpen(true);
                }
              }}
              title={player.id === myPlayerId ? "Click to change avatar" : ""}
            >
              <Image 
                src={player.avatar} 
                alt={player.name}
                fill
                style={{ objectFit: 'contain', padding: '8px' }}
                unoptimized
              />
              {player.id === myPlayerId && (
                <div className={styles.editIconBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
              )}
            </div>
            <div className={styles.playerName}>{player.name}</div>
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
          <div className={styles.hostFooter}>
            <div className={styles.settingsPanel}>
              <div className={styles.settingsHeader}>
                <span className={styles.settingsTitle}>⚙️ Host Game Settings</span>
                <span className={styles.settingsBadge}>👑 HOST</span>
              </div>

              <div className={styles.settingsGrid}>
                <div className={styles.settingItemFull}>
                  <label className={styles.settingLabel} htmlFor="category-select">
                    📁 Word Category
                  </label>
                  <select
                    id="category-select"
                    className={styles.settingSelect}
                    value={roomSettings.category}
                    onChange={(e) => handleUpdateSetting({ category: e.target.value })}
                  >
                    <option value="Random">🎲 Random (All Categories)</option>
                    <option value="Food & Drinks">🍕 Food & Drinks</option>
                    <option value="Animals">🦁 Animals</option>
                    <option value="Everyday Objects">🎸 Everyday Objects</option>
                    <option value="Places & Landmarks">🗼 Places & Landmarks</option>
                    <option value="Vehicles">🚀 Vehicles</option>
                    <option value="Clothing & Fashion">🕶️ Clothing & Fashion</option>
                  </select>
                </div>

                <div className={styles.settingItem}>
                  <label className={styles.settingLabel} htmlFor="draw-time-slider">
                    ✏️ Drawing Time
                  </label>
                  <div className={styles.sliderRow}>
                    <input
                      id="draw-time-slider"
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      className={styles.sliderInput}
                      value={roomSettings.drawingTime}
                      onChange={(e) => handleLocalSettingChange({ drawingTime: Number(e.target.value) })}
                      onMouseUp={(e) => commitSettingsUpdate({ drawingTime: Number(e.currentTarget.value) })}
                      onTouchEnd={(e) => commitSettingsUpdate({ drawingTime: Number(e.currentTarget.value) })}
                    />
                    <span className={styles.sliderValue}>{roomSettings.drawingTime}s</span>
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <label className={styles.settingLabel} htmlFor="vote-time-slider">
                    🗳️ Voting Time
                  </label>
                  <div className={styles.sliderRow}>
                    <input
                      id="vote-time-slider"
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      className={styles.sliderInput}
                      value={roomSettings.votingTime}
                      onChange={(e) => handleLocalSettingChange({ votingTime: Number(e.target.value) })}
                      onMouseUp={(e) => commitSettingsUpdate({ votingTime: Number(e.currentTarget.value) })}
                      onTouchEnd={(e) => commitSettingsUpdate({ votingTime: Number(e.currentTarget.value) })}
                    />
                    <span className={styles.sliderValue}>{roomSettings.votingTime}s</span>
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <label className={styles.settingLabel} htmlFor="reveal-time-slider">
                    🎭 Role Reveal
                  </label>
                  <div className={styles.sliderRow}>
                    <input
                      id="reveal-time-slider"
                      type="range"
                      min="3"
                      max="15"
                      step="1"
                      className={styles.sliderInput}
                      value={roomSettings.roleRevealTime}
                      onChange={(e) => handleLocalSettingChange({ roleRevealTime: Number(e.target.value) })}
                      onMouseUp={(e) => commitSettingsUpdate({ roleRevealTime: Number(e.currentTarget.value) })}
                      onTouchEnd={(e) => commitSettingsUpdate({ roleRevealTime: Number(e.currentTarget.value) })}
                    />
                    <span className={styles.sliderValue}>{roomSettings.roleRevealTime}s</span>
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <label className={styles.settingLabel} htmlFor="guess-time-slider">
                    🔍 Final Guess
                  </label>
                  <div className={styles.sliderRow}>
                    <input
                      id="guess-time-slider"
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      className={styles.sliderInput}
                      value={roomSettings.finalGuessTime}
                      onChange={(e) => handleLocalSettingChange({ finalGuessTime: Number(e.target.value) })}
                      onMouseUp={(e) => commitSettingsUpdate({ finalGuessTime: Number(e.currentTarget.value) })}
                      onTouchEnd={(e) => commitSettingsUpdate({ finalGuessTime: Number(e.currentTarget.value) })}
                    />
                    <span className={styles.sliderValue}>{roomSettings.finalGuessTime}s</span>
                  </div>
                </div>
              </div>
            </div>

            <ReusableButton 
              onClick={handleStartGame} 
              disabled={!canStartGame}
              style={{ opacity: canStartGame ? 1 : 0.5, cursor: canStartGame ? 'pointer' : 'not-allowed' }}
            >
              START GAME
            </ReusableButton>
            <p className={styles.waitingText}>Players: {activePlayers.length} / {roomMaxPlayers}</p>
            {!canStartGame && <p className={styles.waitingText} style={{ fontSize: '1rem', color: '#666' }}>(Need at least 3 players to start)</p>}
          </div>
        ) : (
          <div className={styles.waitingForHost}>
            Waiting for host to start the game...
          </div>
        )}
      </footer>

      {/* Avatar Picker Modal */}
      {isAvatarModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAvatarModalOpen(false)}>
          <div className={styles.avatarModal} onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Choose your Avatar</h2>
            <div className={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((avatarUrl, i) => (
                <div 
                  key={i} 
                  className={styles.avatarOption} 
                  onClick={() => {
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                      wsRef.current.send(JSON.stringify({ type: 'UPDATE_AVATAR', avatar: avatarUrl }));
                    }
                    setIsAvatarModalOpen(false);
                  }}
                >
                  <Image src={avatarUrl} alt="Avatar option" fill style={{ objectFit: 'contain' }} unoptimized />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                className={styles.exitButton} 
                style={{ position: 'relative', top: '0', left: '0', margin: '0 auto' }} 
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
