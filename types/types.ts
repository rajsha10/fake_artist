export interface CursorPosition {
    x: number;
    y: number;
}

export interface UserPresence {
    id: string;
    name: string;
    color: string;
    cursor: CursorPosition;
}

// Alias for backward compatibility
export type UserPresense = UserPresence;

export type SocketMessage = 
    | { type: 'INIT_PRESENCE'; user: UserPresence }
    | { type: 'CURSOR_MOVE'; id: string; cursor: CursorPosition }
    | { type: 'USER_LEFT'; id: string }
    | { type: 'SYNC_STATE'; users: UserPresence[] }
    | { type: 'UPDATE_NAME'; id: string; name: string };
