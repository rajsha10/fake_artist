import {WebSocket} from "ws";
import { GameRoom } from "./GameRoom";

export interface SessionInfo {
    roomId: string;
    playerId:  string;
}
export class RoomManager{
    private static instance: RoomManager;
    private rooms: Map<string, GameRoom> = new Map();

    private socketSessions: Map<WebSocket, SessionInfo> = new Map();
    private constructor() {}

    public static getInstance(): RoomManager {
        if(!RoomManager.instance){
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    //get existing room or get new one
    public getOrCreateRoom(roomId: string){
        const normalizedId = roomId.trim().toUpperCase();
        let room = this.rooms.get(normalizedId);

        if(!room){
            room = new GameRoom(normalizedId);
            this.rooms.set(normalizedId, room);
            console.log(`[RoomManager] Created new room: ${normalizedId}`);
        }
        return room;
    }

    public getRoom(roomId: string): GameRoom | undefined {
        return this.rooms.get(roomId.trim().toUpperCase());
    }

    //websocket with player or room
    public registerSession(socket: WebSocket, roomId: string, playerId: string): void {
        this.socketSessions.set(socket, {
            roomId: roomId.trim().toUpperCase(),
            playerId
        })
    }

    //fetch session info
    public getSession(socket: WebSocket): SessionInfo | undefined {
        return this.socketSessions.get(socket);
    }

    //clean up empty room and player diconnection merged
    public handleDisconnect(socket: WebSocket): void {
        const session = this.socketSessions.get(socket);
        if(!session) return;

        const { roomId, playerId } = session;
        const room = this.rooms.get(roomId);

        if(room){
            room.removePlayer(playerId);
            console.log(`[RoomManager] Player ${playerId} disconnected from room ${roomId}`);

            if(room.getPlayerCount() === 0){
                this.rooms.delete(roomId);
                console.log(`[RoomManager] Room ${roomId} is empty and was removed.`);
            }
        }
        this.socketSessions.delete(socket);
    }
}