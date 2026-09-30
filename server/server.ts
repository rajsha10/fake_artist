import { WebSocket, WebSocketServer } from "ws";
import type { ClientMessage } from "@/types/game";
import { RoomManager } from "./game/RoomManager";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
const roomManager = RoomManager.getInstance();

console.log(`Fake Artist Game Server running on ws://localhost:${PORT}`);

wss.on('connection', (socket: WebSocket) => {
    console.log('[Server] New WebSocket connection established');

    socket.on('message', (rawPayload: Buffer) => {
        try {
            const msg: ClientMessage = JSON.parse(rawPayload.toString());

            //join room
            if (msg.type === 'JOIN_ROOM') {
                const { roomId, name } = msg;
                if (!roomId || !name) {
                    socket.send(
                        JSON.stringify({
                            type: 'ERROR',
                            message: 'Room ID and Name are required to join!',
                        })
                    )
                    return;
                }

                const normalizedRoomId = roomId.trim().toUpperCase();
                const playerId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                const room = roomManager.getOrCreateRoom(normalizedRoomId);

                roomManager.registerSession(socket, normalizedRoomId, playerId);
                room.addPlayer(playerId, name.trim(), socket);

                console.log(`[Server] Player "${name}" (${playerId}) joined Room: ${normalizedRoomId}`);
                return;
            }

            //other actions suing authenticated session
            const session = roomManager.getSession(socket);
            if (!session) {
                socket.send(
                    JSON.stringify({
                        type: 'ERROR',
                        message: 'You must join a room first!',
                    })
                );
                return;
            }

            const { roomId, playerId } = session;
            const room = roomManager.getRoom(roomId);
            if (!room) {
                socket.send(
                    JSON.stringify({
                        type: 'ERROR',
                        message: 'Room no longer exist.',
                    })
                )
            }

            switch (msg.type) {
                case 'START_GAME':
                    room?.startGame(playerId, msg.category, msg.word);
                    break;

                case 'DRAW_START':
                    room?.handleDrawStart(playerId, msg.point);
                    break;

                case 'DRAW_MOVE':
                    room?.handleDrawMove(playerId, msg.point);
                    break;

                case 'DRAW_END':
                    room?.handleDrawEnd(playerId);
                    break;

                case 'SUBMIT_VOTE':
                    room?.handleVote(playerId, msg.suspectId);
                    break;

                case 'SUBMIT_FINAL_GUESS':
                    room?.handleFinalGuess(playerId, msg.guess);
                    break;

                case 'RESTART_GAME':
                    room?.restartGame(playerId);
                    break;

                default:
                    console.warn(`[Server] Unhandled message type:`, msg);
            }
        } catch (err) {
            console.error('[Server] Failed to process message:', err);
        }
    });

    socket.on('close', () => {
        roomManager.handleDisconnect(socket);
    });

    socket.on('error', (err) => {
        console.error('[Server] Socket error:', err);
        roomManager.handleDisconnect(socket);
    });
})