// test/testGame.ts

import { WebSocket } from 'ws';
import type { ClientMessage, ServerMessage, Role } from '../types/game';

const SERVER_URL = 'ws://localhost:8080';
const ROOM_ID = 'TEST-ROOM';

interface BotClient {
  name: string;
  socket: WebSocket;
  role?: Role;
  secretWord?: string | null;
  playerId?: string;
}

function createBot(name: string): Promise<BotClient> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(SERVER_URL);
    const bot: BotClient = { name, socket };

    socket.on('open', () => {
      console.log(`🤖 [${name}] Connected to server.`);
      const joinMsg: ClientMessage = {
        type: 'JOIN_ROOM',
        roomId: ROOM_ID,
        name,
      };
      socket.send(JSON.stringify(joinMsg));
      resolve(bot);
    });

    socket.on('error', (err) => {
      console.error(`❌ [${name}] Connection error:`, err);
      reject(err);
    });
  });
}

async function runTest() {
  console.log('🚀 Starting Fake Artist Backend Integration Test...\n');

  // 1. Connect 3 Bots
  const alice = await createBot('Alice (Host)');
  const bob = await createBot('Bob');
  const charlie = await createBot('Charlie');
  const bots = [alice, bob, charlie];

  let fakeArtistBot: BotClient | null = null;
  let realArtistBots: BotClient[] = [];

  // Setup message handlers for all bots
  bots.forEach((bot) => {
    bot.socket.on('message', (raw) => {
      const msg: ServerMessage = JSON.parse(raw.toString());

      if (msg.type === 'ERROR') {
        console.error(`❌ [${bot.name}] Received Error: ${msg.message}`);
      }

      if (msg.type === 'ROLE_ASSIGNED') {
        bot.role = msg.role;
        bot.secretWord = msg.word;

        if (msg.role === 'FAKE_ARTIST') {
          console.log(`🕵️ [${bot.name}] Secret Role: FAKE ARTIST! Category: "${msg.category}", Word: (HIDDEN/null)`);
          fakeArtistBot = bot;
        } else {
          console.log(`🎨 [${bot.name}] Secret Role: REAL ARTIST. Category: "${msg.category}", Word: "${msg.word}"`);
          realArtistBots.push(bot);
        }
      }

      if (msg.type === 'STATE_UPDATE') {
        // 1. Always map player IDs first
        msg.state.players.forEach((p) => {
          const found = bots.find((b) => b.name === p.name);
          if (found) found.playerId = p.id;
        });

        const { phase, currentRound, activePlayerId, winner, winnerReason } = msg.state;
        console.log(`📊 [STATE] Phase: ${phase} | Round: ${currentRound} | ActivePlayer: ${activePlayerId || 'None'}`);

        // 2. If it's drawing phase, simulate stroke for the currently active player
        if (phase === 'DRAWING_R1' || phase === 'DRAWING_R2') {
          if (activePlayerId) {
            const activeBot = bots.find((b) => b.playerId === activePlayerId);
            if (activeBot && activeBot.socket === bot.socket) {
              console.log(`✍️ [${activeBot.name}] Drawing 1 continuous stroke...`);

              // Start stroke
              bot.socket.send(JSON.stringify({ type: 'DRAW_START', point: { x: 0.2, y: 0.2 } }));

              // Add points
              setTimeout(() => {
                bot.socket.send(JSON.stringify({ type: 'DRAW_MOVE', point: { x: 0.5, y: 0.5 } }));
              }, 100);

              // Finish stroke (triggers advanceTurn on server)
              setTimeout(() => {
                bot.socket.send(JSON.stringify({ type: 'DRAW_END' }));
              }, 200);
            }
          }
        }

        // 3. When Voting phase starts, all bots vote for the Fake Artist to test Showdown!
        if (phase === 'VOTING') {
          if (fakeArtistBot && fakeArtistBot.playerId) {
            console.log(`🗳️ [${bot.name}] Voting to accuse suspect: ${fakeArtistBot.name}`);
            bot.socket.send(
              JSON.stringify({
                type: 'SUBMIT_VOTE',
                suspectId: fakeArtistBot.playerId,
              })
            );
          }
        }

        // 4. When Final Guess Showdown starts, Fake Artist submits their guess
        if (phase === 'FINAL_GUESS') {
          if (fakeArtistBot && fakeArtistBot.socket === bot.socket) {
            console.log(`🎯 [${fakeArtistBot.name}] (Fake Artist) Submitting Final Guess: "Pizza"...`);
            bot.socket.send(
              JSON.stringify({
                type: 'SUBMIT_FINAL_GUESS',
                guess: 'Pizza',
              })
            );
          }
        }

        // 5. Game Over summary
        if (phase === 'GAME_OVER') {
          console.log(`\n🏆 GAME OVER! Winner: ${winner}`);
          console.log(`📝 Reason: ${winnerReason}`);
          console.log('\n✅ BACKEND INTEGRATION TEST PASSED COMPLETELY!\n');
          process.exit(0);
        }
      }
    });
  });

  // Wait 1 second for all bots to connect, then Alice starts the game
  setTimeout(() => {
    console.log('\n👑 Alice is starting the game with Category: "Food & Drinks", Word: "Pizza"...');
    alice.socket.send(
      JSON.stringify({
        type: 'START_GAME',
        category: 'Food & Drinks',
        word: 'Pizza',
      })
    );
  }, 1000);
}

runTest().catch(console.error);