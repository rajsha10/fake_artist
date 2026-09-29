
//privateRolePayload
export type GamePhase = 
    | 'LOBBY'
    | 'ROLE_REVEAL'
    | 'DRAWING_R1'
    | 'DRAWING_R2'
    | 'VOTING'
    | 'FINAL_GUESS'
    | 'GAME_OVER';

export type Role = 'REAL_ARTIST' | 'FAKE_ARTIST' | 'QUESTION_MASTER';

export interface Point{
    x: number;
    y: number;
}

export interface Stroke{
    id: string;
    playerId: string;
    color: string;
    points: Point[];
}

export interface Player{
    id: string;
    name: string;
    color: string;
    isHost: boolean;
    score: number;
    hasDrawnThisRound: boolean;
    votedForId: string | null;
}

//PublicGameState
export interface PublicGameState{
    phase: GamePhase;
    category: string;
    currentRound: 1| 2;
    activePlayerId: string | null;
    turnTimeLeft: number;
    players: Player[];
    strokes: Stroke[];
    hostId: string;
    accusedPlayerId: string | null;
    winner: 'REAL_ARTISTS' | 'FAKE_ARTIST' | null;
    winnerReason: string | null; 
}

// WebSokcet messages
export type ClientMessage = 
    | { type: 'JOIN_ROOM'; roomId: string; name: string }
    | { type: 'START_GAME'; category?: string; word?: string }
    | { type: 'DRAW_START'; point: Point }
    | { type: 'DRAW_MOVE'; point: Point }
    | { type: 'DRAW_END' }
    | { type: 'SUBMIT_VOTE'; suspectId: string }
    | { type: 'SUBMIT_FINAL_GUESS'; guess: string }
    | { type: 'RESTART_GAME' };

export type ServerMessage = 
    | { type: 'STATE_UPDATE'; state: PublicGameState }
    | { type: 'TIME_TICK'; timeLeft: number }
    | { type: 'STROKE_START'; strokeId: string; playerId: string; color: string; point: Point }
    | { type: 'STROKE_POINT'; strokeId: string; point: Point }
    | { type: 'STROKE_FINISH'; stroke: Stroke }
    | { type: 'VOTING_RESULT'; votes: Record<string, string[]>; fakeArtistCaught: boolean }
    | { type: 'GAME_RESULT'; winner: 'REAL_ARTISTS' | 'FAKE_ARTIST'; secretWord: string; reason: string }
    | { type: 'ERROR'; message: string }
    | {
        type: 'ROLE_ASSIGNED';
        role: Role;
        category: string;
        word: string | null;
    }
