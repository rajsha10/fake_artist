import { WebSocketServer, WebSocket } from "ws";
import type { SocketMessage, UserPresence } from "./types/types";

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map<WebSocket, UserPresence>();

console.log('Canvas WebSocket Server Running on ws://localhost:8080');

function broadcast(message: SocketMessage, excludeSocket?: WebSocket){
    const payload = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if(client !== excludeSocket && client.readyState === WebSocket.OPEN){
            client.send(payload);
        }
    });
}

wss.on('connection', (socket: WebSocket) => {
    socket.on('message', (rawPayload: Buffer) => {
        try{
            const msg: SocketMessage = JSON.parse(rawPayload.toString());

            if(msg.type === 'INIT_PRESENCE'){
                clients.set(socket, msg.user);
                const activeUsers = Array.from(clients.values()).filter(
                    (u) => u.id !== msg.user.id
                );

                socket.send(JSON.stringify({ type: 'SYNC_STATE', users: activeUsers }));
                broadcast(msg, socket);
            }

            if(msg.type === 'CURSOR_MOVE'){
                const user = clients.get(socket);
                if(user){
                    user.cursor = msg.cursor;
                }

                broadcast(msg, socket);
            }

            if(msg.type === 'UPDATE_NAME'){
                const user = clients.get(socket);
                if(user){
                    user.name = msg.name;
                }

                broadcast(msg, socket);
            }
        } catch(e){
            console.error('Invalid payload received: ', e);
        }
    });

    socket.on('close', () => {
        const user = clients.get(socket);
        if(user){
            clients.delete(socket);
            broadcast({ type: 'USER_LEFT', id: user.id });
            console.log(`User left: ${user.name} (${user.id})`);
        }
    });

    socket.on('error', (err) => {
        console.error('Invalid Socket connection : ', err);
    });
});