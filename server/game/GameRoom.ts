
import { WebSocket } from "ws";
import type {
    GamePhase,
    Player,
    Point,
    PublicGameState,
    Role,
    ServerMessage,
    Stroke,
} from "@/types/game";
import { WordManager } from "./WordManager";
import { PLAYER_COLORS } from "@/config/ColorConfig";
import next from "next";

interface ConnectedPlayer {
    player: Player;
    socket: WebSocket;
    role?: Role;
}

export class GameRoom {
    public readonly roomId: string;
    private clients: Map<string, ConnectedPlayer> = new Map();
    private turnOrder: string[] = [];
    private currentTurnIndex: number = 0;

    //Game State for each room
    private phase: GamePhase = 'LOBBY';
    private currentRound: 1 | 2 = 1;
    private category: string = "";
    private secretWord: string = "";
    private fakeArtistId: string = "";
    private activePlayerId: string | null = "";
    private accusedPlayerId: string | null = "";
    private winner: 'REAL_ARTISTS' | 'FAKE_ARTIST' | null = null;
    private winnerReason: string | null = null;

    private strokes: Stroke[] = [];
    private currentStroke: Stroke | null = null;

    private timer: NodeJS.Timeout | null = null;
    private timeLeft: number = 0;

    constructor(roomId: string) {
        this.roomId = roomId;
    }

    //player managements
    public addPlayer(id: string, name: string, socket: WebSocket): Player {
        const isHost = this.clients.size === 0;
        const color = PLAYER_COLORS[this.clients.size % PLAYER_COLORS.length];

        const player: Player = {
            id,
            name,
            color,
            isHost,
            score: 0,
            hasDrawnThisRound: false,
            votedForId: null,
        };

        this.clients.set(id, { player, socket });

        this.broadcastState();
        return player;
    }

    public removePlayer(id: string): void {
        const wasHost = this.clients.get(id)?.player.isHost;
        this.clients.delete(id);

        if (this.clients.size === 0) {
            this.clearTimer();
            return;
        }

        if (wasHost) {
            const nextPlayer = this.clients.values().next().value;
            if (nextPlayer) {
                nextPlayer.player.isHost = true;
            }
        }

        if (this.activePlayerId === id) {
            this.advanceTurn();
        } else {
            this.broadcastState();
        }
    }

    public getPlayerCount(): number {
        return this.clients.size;
    }

    public getHostId(): string {
        for (const [id, cp] of this.clients.entries()) {
            if (cp.player.isHost) return id;
        }
        return "";
    }

    //game flow and states machine
    public startGame(hostId: string, customCategory?: string, customWord?: string): boolean {
        const host = this.clients.get(hostId);
        if (!host || !host.player.isHost) return false;

        if (this.clients.size < 3) {
            this.sendToSocket(host.socket, {
                type: 'ERROR',
                message: 'At least 3 player are required to play!',
            });
            return false;
        }

        if (!customCategory && customWord) {
            this.category = customCategory;
            this.secretWord = customWord;
        } else if (customCategory) {
            const entry = WordManager.getRandomWordFromCategory(customCategory);
            this.category = entry.category;
            this.secretWord = entry.word;
        } else {
            const entry = WordManager.getRandomWord();
            this.category = entry.category;
            this.secretWord = entry.word;
        }

        const playerIds = Array.from(this.clients.keys());
        const fakeArtistIndex = Math.floor(Math.random() * playerIds.length);
        this.fakeArtistId = playerIds[fakeArtistIndex];

        this.turnOrder = [...playerIds].sort(() => Math.random() - 0.5);
        this.currentTurnIndex = 0;
        this.currentRound = 1;
        this.strokes = [];
        this.accusedPlayerId = null;
        this.winner = null;
        this.winnerReason = null;

        for (const cp of this.clients.values()) {
            cp.player.hasDrawnThisRound = false;
            cp.player.votedForId = null;
            cp.role = cp.player.id === this.fakeArtistId ? 'FAKE_ARTIST' : 'REAL_ARTIST';
        }

        //private role cards
        for (const [id, cp] of this.clients.entries()) {
            const isFake = id === this.fakeArtistId;
            this.sendToSocket(cp.socket, {
                type: 'ROLE_ASSIGNED',
                role: isFake ? 'FAKE_ARTIST' : 'REAL_ARTIST',
                category: this.category,
                word: isFake ? null : this.secretWord,
            });
        }

        //role reveal
        this.phase = 'ROLE_REVEAL';
        this.startCountdown(8, () => {
            this.startRound(1);
        });

        this.broadcastState();
        return true;
    }

    private startTurn(): void {
        if (this.currentTurnIndex >= this.turnOrder.length) {

            if (this.currentRound) {
                this.startRound(2);
            } else {
                this.startVotingPhase();
            }
            return;
        }
        this.activePlayerId = this.turnOrder[this.currentTurnIndex];
        this.currentStroke = null;

        this.startCountdown(20, () => {
            this.handleDrawEnd(this.activePlayerId!);
        });

        this.broadcastState();
    }

    private advanceTurn(): void {
        this.clearTimer();
        this.currentTurnIndex++;
        this.startTurn();
    }

    //drawing and strokes
    public handleDrawStart(playerId: string, point: Point): void {
        if (this.phase !== 'DRAWING_R1' && this.phase !== 'DRAWING_R2') return;
        if (this.activePlayerId !== playerId) return;
        const cp = this.clients.get(playerId);
        if (!cp || cp.player.hasDrawnThisRound) return;
        const strokeId = `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        this.currentStroke = {
            id: strokeId,
            playerId,
            color: cp.player.color,
            points: [point],
        };
        this.broadcast({
            type: 'STROKE_START',
            strokeId,
            playerId,
            color: cp.player.color,
            point,
        });
    }

}