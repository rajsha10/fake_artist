'use client';

import { useEffect, useRef, useState } from 'react';
import type { SocketMessage, UserPresence } from '@/types/types';

const PALETTE = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function CanvasPage() {
  const [self, setSelf] = useState<UserPresence | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, UserPresence>>({});
  const [isConnected, setIsConnected] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const socketRef = useRef<WebSocket | null>(null);
  const lastSendTime = useRef(0);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 9);
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('draw_user_name') : null;
    const name = savedName || `Maker-${Math.floor(100 + Math.random() * 900)}`;

    const currentUser: UserPresence = { id, name, color, cursor: { x: 0, y: 0 } };
    setSelf(currentUser);
    setNameInput(name);

    const socket = new WebSocket('ws://localhost:8080');
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      socket.send(JSON.stringify({ type: 'INIT_PRESENCE', user: currentUser }));
    };

    socket.onmessage = (event) => {
      try {
        const msg: SocketMessage = JSON.parse(event.data);

        if (msg.type === 'SYNC_STATE') {
          const initialMap: Record<string, UserPresence> = {};
          msg.users.forEach((u) => {
            initialMap[u.id] = u;
          });
          setRemoteUsers(initialMap);
        }

        if (msg.type === 'INIT_PRESENCE') {
          setRemoteUsers((prev) => ({ ...prev, [msg.user.id]: msg.user }));
        }

        if (msg.type === 'CURSOR_MOVE') {
          setRemoteUsers((prev) => {
            const existing = prev[msg.id];
            if (!existing) return prev;
            return {
              ...prev,
              [msg.id]: { ...existing, cursor: msg.cursor },
            };
          });
        }

        if (msg.type === 'UPDATE_NAME') {
          setRemoteUsers((prev) => {
            const existing = prev[msg.id];
            if (!existing) return prev;
            return {
              ...prev,
              [msg.id]: { ...existing, name: msg.name },
            };
          });
        }

        if (msg.type === 'USER_LEFT') {
          setRemoteUsers((prev) => {
            const next = { ...prev };
            delete next[msg.id];
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to parse incoming message:', err);
      }
    };

    socket.onclose = () => setIsConnected(false);

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (isEditingName && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && self) {
      if (trimmed !== self.name) {
        const updatedUser = { ...self, name: trimmed };
        setSelf(updatedUser);
        localStorage.setItem('draw_user_name', trimmed);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          const msg: SocketMessage = {
            type: 'UPDATE_NAME',
            id: self.id,
            name: trimmed,
          };
          socketRef.current.send(JSON.stringify(msg));
        }
      }
    } else if (self) {
      setNameInput(self.name);
    }
    setIsEditingName(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!socketRef.current || !self) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - bounds.left);
    const y = Math.round(e.clientY - bounds.top);

    const now = performance.now();
    if (now - lastSendTime.current > 30) {
      lastSendTime.current = now;

      if (socketRef.current.readyState === WebSocket.OPEN) {
        const msg: SocketMessage = {
          type: 'CURSOR_MOVE',
          id: self.id,
          cursor: { x, y },
        };
        socketRef.current.send(JSON.stringify(msg));
      }
    }
  };

  const remoteUsersList = Object.values(remoteUsers);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white select-none cursor-crosshair"
      onPointerMove={handlePointerMove}
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* User Name & Rename */}
          {self && (
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 shadow"
                style={{ backgroundColor: self.color }}
              />

              {isEditingName ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveName();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    ref={editInputRef}
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setNameInput(self.name);
                        setIsEditingName(false);
                      }
                    }}
                    maxLength={25}
                    className="bg-slate-800 text-slate-100 text-xs px-2.5 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-400 transition w-32"
                    placeholder="Enter name..."
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2 py-1 rounded-lg font-medium transition cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(self.name);
                    setIsEditingName(true);
                  }}
                  title="Click to rename"
                  className="group flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white transition cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-slate-800/80"
                >
                  <span>{self.name}</span>
                  <span className="text-xs text-slate-500">(You)</span>
                  <svg
                    className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 opacity-60 group-hover:opacity-100 transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Collaborators List */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto">
          <span className="text-xs text-slate-400 mr-1 font-medium">
            {remoteUsersList.length + (self ? 1 : 0)} Online
          </span>
          <div className="flex -space-x-1.5 overflow-hidden">
            {self && (
              <div
                title={`${self.name} (You)`}
                className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ring-2 ring-slate-900 text-white"
                style={{ backgroundColor: self.color }}
              >
                {self.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {remoteUsersList.map((user) => (
              <div
                key={user.id}
                title={user.name}
                className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ring-2 ring-slate-900 text-white transition-transform hover:scale-110"
                style={{ backgroundColor: user.color }}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Canvas Helper Info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-800/80 text-xs text-slate-400 shadow-lg pointer-events-none">
        Move your cursor around to broadcast your position in real-time.
      </div>

      {/* Remote Live Cursors */}
      {remoteUsersList.map((user) => (
        <div
          key={user.id}
          className="absolute top-0 left-0 pointer-events-none transition-transform duration-75 ease-out will-change-transform z-40"
          style={{
            transform: `translate3d(${user.cursor.x}px, ${user.cursor.y}px, 0)`,
          }}
        >
          {/* Cursor Pointer SVG */}
          <svg
            className="w-6 h-6 -translate-x-1 -translate-y-1 drop-shadow-md"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
              fill={user.color}
              stroke="#ffffff"
              strokeWidth="1.2"
            />
          </svg>

          {/* User Name Badge */}
          <div
            className="ml-4 -mt-2 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white shadow-md whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </div>
  );
}