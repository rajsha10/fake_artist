import { WebSocket } from "ws";
import type {
    GamePhase,
    Player,
    Point,
    PublicGameState,
    Role,
    RoomSettings,
    ServerMessage,
    Stroke,
} from "@/types/game";
import { WordManager } from "./WordManager";
import { PLAYER_COLORS } from "@/config/ColorConfig";
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
    private maxPlayers: number = 10;

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

    private roomSettings: RoomSettings = {
        drawingTime: 20,
        votingTime: 10,
        roleRevealTime: 8,
        finalGuessTime: 25,
        category: "Random",
    };

    constructor(roomId: string) {
        this.roomId = roomId;
    }

    //player managements
    public addPlayer(id: string, name: string, socket: WebSocket, maxPlayersRequested?: number): Player | null {
        if (this.clients.size >= this.maxPlayers) {
            return null; // Room is full
        }

        const isHost = this.clients.size === 0;
        
        if (isHost && maxPlayersRequested !== undefined) {
            this.maxPlayers = Math.max(3, Math.min(10, maxPlayersRequested));
        }

        const color = PLAYER_COLORS[this.clients.size % PLAYER_COLORS.length];

        const player: Player = {
            id,
            name,
            color,
            avatar: `/assets/Profiles/avatar_${(this.clients.size % 10) + 1}.jpg`,
            isHost,
            score: 0,
            hasDrawnThisRound: false,
            votedForId: null,
        };

        this.clients.set(id, { player, socket });

        this.broadcastState();
        return player;
    }

    public updateAvatar(playerId: string, avatar: string): void {
        const cp = this.clients.get(playerId);
        if (cp) {
            cp.player.avatar = avatar;
            this.broadcastState();
        }
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

        if (customCategory && customWord) {
            this.category = customCategory;
            this.secretWord = customWord;
        } else {
            const selectedCategory = customCategory ?? this.roomSettings.category;
            if (selectedCategory === "Random" || !selectedCategory) {
                const entry = WordManager.getRandomWord();
                this.category = entry.category;
                this.secretWord = entry.word;
            } else {
                const entry = WordManager.getRandomWordFromCategory(selectedCategory);
                this.category = entry.category;
                this.secretWord = entry.word;
            }
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
        this.startCountdown(this.roomSettings.roleRevealTime, () => {
            this.startRound(1);
        });

        this.broadcastState();
        return true;
    }

    private startTurn(): void {
        if (this.currentTurnIndex >= this.turnOrder.length) {

            if (this.currentRound === 1) {
                this.startRound(2);
            } else {
                this.startVotingPhase();
            }
            return;
        }
        this.activePlayerId = this.turnOrder[this.currentTurnIndex];
        this.currentStroke = null;

        this.startCountdown(this.roomSettings.drawingTime, () => {
            this.handleDrawEnd(this.activePlayerId!);
        });

        this.broadcastState();
    }

    private startRound(round: 1 | 2): void {
        this.currentRound = round;
        this.currentTurnIndex = 0;
        this.phase = round === 1 ? 'DRAWING_R1' : 'DRAWING_R2';
        for (const cp of this.clients.values()) {
            cp.player.hasDrawnThisRound = false;
        }

        this.startTurn();
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

    public handleDrawMove(playerId: string, point: Point): void {
        if (!this.currentStroke || this.currentStroke.playerId !== playerId) return;
        if (this.activePlayerId !== playerId) return;
        this.currentStroke.points.push(point);
        this.broadcast({
            type: 'STROKE_POINT',
            strokeId: this.currentStroke.id,
            point,
        });
    }

    public handleDrawMoveBatch(playerId: string, points: Point[]): void {
        if (!this.currentStroke || this.currentStroke.playerId !== playerId) return;
        if (this.activePlayerId !== playerId) return;
        this.currentStroke.points.push(...points);
        this.broadcast({
            type: 'STROKE_POINTS',
            strokeId: this.currentStroke.id,
            points,
        });
    }

    public handleDrawEnd(playerId: string): void {
        if (this.activePlayerId !== playerId) return;
        const cp = this.clients.get(playerId);
        if (cp) {
            cp.player.hasDrawnThisRound = true;
        }
        if (this.currentStroke) {
            this.strokes.push(this.currentStroke);
            this.broadcast({
                type: 'STROKE_FINISH',
                stroke: this.currentStroke,
            });
            this.currentStroke = null;
        }
        this.advanceTurn();
    }


    //voting rooms logic
    private startVotingPhase(): void {
        this.phase = 'VOTING';
        this.activePlayerId = null;

        for (const cp of this.clients.values()) {
            cp.player.votedForId = null;
        }

        this.startCountdown(this.roomSettings.votingTime, () => {
            this.evaluateVotes();
        });
        this.broadcastState();
    }

    public handleVote(voterId: string, suspectId: string): void {
        if (this.phase !== 'VOTING') return;
        const voter = this.clients.get(voterId);
        if (!voter || !this.clients.has(suspectId)) return;

        voter.player.votedForId = suspectId;
        this.broadcastState();

        const allVoted = Array.from(this.clients.values()).every((c) => c.player.votedForId !== null);
        if (allVoted) {
            this.clearTimer();
            this.evaluateVotes();
        }
    }

    private evaluateVotes(): void {
        const voteCounts: Record<string, number> = {};
        const voteMap: Record<string, string[]> = {};
        for (const [id, cp] of this.clients.entries()) {
            const suspectId = cp.player.votedForId;
            if (suspectId) {
                voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
                if (!voteMap[suspectId]) voteMap[suspectId] = [];
                voteMap[suspectId].push(cp.player.name);
            }
        }

        let maxVotes = -1;
        let mostVotedId: string | null = null;
        let isTie = false;
        for (const [suspectId, count] of Object.entries(voteCounts)) {
            if (count > maxVotes) {
                maxVotes = count;
                mostVotedId = suspectId;
                isTie = false;
            } else if (count === maxVotes) {
                isTie = true;
            }
        }

        const fakeArtistId = !isTie && mostVotedId === this.fakeArtistId;
        this.accusedPlayerId = mostVotedId;
        this.broadcast({
            type: 'VOTING_RESULT',
            votes: voteMap,
            fakeArtistCaught: fakeArtistId,
        });
        if (fakeArtistId && mostVotedId) {
            this.startFinalGuessShowdown();
        } else {
            this.endGame(
                'FAKE_ARTIST',
                `The Real Artists failed to identify the Fake Artist! ${this.clients.get(this.fakeArtistId)?.player.name} was the Fake Artist.`
            );
        }
    }

    private startFinalGuessShowdown(): void {
        this.phase = 'FINAL_GUESS';
        this.accusedPlayerId = this.fakeArtistId;

        this.startCountdown(this.roomSettings.finalGuessTime, () => {
            this.endGame(
                'REAL_ARTISTS',
                `Time ran out! The Fake Artist (${this.clients.get(this.fakeArtistId)?.player.name}) failed to guess the secret word "${this.secretWord}".`
            );
        });
        this.broadcastState();
    }

    public handleFinalGuess(fakeArtistId: string, guess: string) {
        if (this.phase !== 'FINAL_GUESS' || this.fakeArtistId !== fakeArtistId) return;
        this.clearTimer();
        const isCorrect = WordManager.isGuessCorrect(guess, this.secretWord);
        if (isCorrect) {
            this.endGame(
                'FAKE_ARTIST',
                `The Fake Artist guessed correctly! The secret word was "${this.secretWord}".`
            );
        } else {
            this.endGame(
                'REAL_ARTISTS',
                `The Fake Artist guessed "${guess}", but the secret word was "${this.secretWord}". Real Artists win!`
            );
        }
    }

    private endGame(winner: 'FAKE_ARTIST' | 'REAL_ARTISTS', reason: string) {
        this.phase = 'GAME_OVER';
        this.winner = winner;
        this.winnerReason = reason;
        this.activePlayerId = null;

        if (winner === 'FAKE_ARTIST') {
            const fa = this.clients.get(this.fakeArtistId);
            if (fa) {
                fa.player.score += 2;
            }
        } else {
            for (const [id, cp] of this.clients.entries()) {
                if (id !== this.fakeArtistId) {
                    cp.player.score += 1;
                }
            }
        }
        this.broadcast({
            type: 'GAME_RESULT',
            winner,
            secretWord: this.secretWord,
            reason,
        })
        this.broadcastState();
    }

    public restartGame(hostId: string) {
        const host = this.clients.get(hostId);
        if (!host || !host.player.isHost) return;
        this.phase = 'LOBBY';
        this.strokes = [];
        this.accusedPlayerId = null;
        this.accusedPlayerId = null;
        this.winner = null;
        this.winnerReason = null;
        this.clearTimer();

        for (const cp of this.clients.values()) {
            cp.player.hasDrawnThisRound = false;
            cp.player.votedForId = null;
            cp.role = undefined;
        }
        this.broadcastState();
    }

    public updateSettings(playerId: string, newSettings: Partial<RoomSettings>): boolean {
        const player = this.clients.get(playerId);
        if (!player || !player.player.isHost) {
            return false;
        }

        if (newSettings.drawingTime !== undefined) {
            this.roomSettings.drawingTime = Math.max(10, Math.min(120, newSettings.drawingTime));
        }
        if (newSettings.votingTime !== undefined) {
            this.roomSettings.votingTime = Math.max(5, Math.min(60, newSettings.votingTime));
        }
        if (newSettings.roleRevealTime !== undefined) {
            this.roomSettings.roleRevealTime = Math.max(3, Math.min(30, newSettings.roleRevealTime));
        }
        if (newSettings.finalGuessTime !== undefined) {
            this.roomSettings.finalGuessTime = Math.max(10, Math.min(120, newSettings.finalGuessTime));
        }
        if (newSettings.category !== undefined) {
            this.roomSettings.category = newSettings.category.slice(0, 50); // limit string length
        }

        this.broadcastState();
        return true;
    }

    //time utilities
    private clearTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private startCountdown(seconds: number, onComplete: () => void): void {
        this.clearTimer();
        this.timeLeft = seconds;
        this.broadcast({
            type: 'TIME_TICK',
            timeLeft: this.timeLeft
        })
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.broadcast({ type: 'TIME_TICK', timeLeft: this.timeLeft });
            if (this.timeLeft <= 0) {
                this.clearTimer();
                onComplete();
            }
        }, 1000);
    }

    //broadcast utilities
    public broadcastState(): void {
        this.broadcast({
            type: 'STATE_UPDATE',
            state: this.getPublicState(),
        });
    }
    public broadcast(message: ServerMessage): void {
        const payload = JSON.stringify(message);
        for (const cp of this.clients.values()) {
            if (cp.socket.readyState === WebSocket.OPEN) {
                cp.socket.send(payload);
            }
        }
    }
    public sendToSocket(socket: WebSocket, message: ServerMessage): void {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }
    public getPublicState(): PublicGameState {
        return {
            phase: this.phase,
            category: this.category,
            currentRound: this.currentRound,
            activePlayerId: this.activePlayerId,
            turnTimeLeft: this.timeLeft,
            maxPlayers: this.maxPlayers,
            players: Array.from(this.clients.values()).map((cp) => cp.player),
            strokes: this.strokes,
            hostId: this.getHostId(),
            accusedPlayerId: this.accusedPlayerId,
            winner: this.winner,
            winnerReason: this.winnerReason,
            settings: this.roomSettings,
        };
    }
}