import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface GameCanvasProps {
  ws: WebSocket | null;
  phase: string;
  myPlayerId: string;
  activePlayerId: string | null;
  timeLeft: number | null;
  players: any[];
  roleInfo?: {
    role: string;
    category: string;
    word?: string | null;
  } | null;
}

export default function GameCanvas({
  ws,
  phase,
  myPlayerId,
  activePlayerId,
  timeLeft,
  players,
  roleInfo
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const isMyTurn = Boolean(myPlayerId && activePlayerId && myPlayerId === activePlayerId);
  const activePlayer = players.find((p) => p.id === activePlayerId);
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const myColor = myPlayer?.color || '#ef4444';

  const isFakeArtist = roleInfo?.role === 'FAKE_ARTIST' || !roleInfo?.word;
  const secretWord = roleInfo?.word;

  // Helper to draw a full stroke on the 2D canvas
  const renderStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: any) => {
    if (!stroke || !stroke.points || stroke.points.length === 0) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color || '#1a1a1a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    if (stroke.points.length === 1) {
      // Draw small dot if only one point
      ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
    } else {
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
    }
    ctx.stroke();
  }, []);

  // Clear and redraw all strokes from saved history
  const redrawAllStrokes = useCallback(
    (strokes: any[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      strokes.forEach((stroke) => renderStroke(ctx, stroke));
    },
    [renderStroke]
  );

  // WebSocket message listener for drawing & state updates
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (msg.type === 'STATE_UPDATE' && msg.state) {
          if (msg.state.strokes) {
            strokesRef.current = msg.state.strokes;
            redrawAllStrokes(msg.state.strokes);
          }
        } else if (msg.type === 'STROKE_START') {
          // Initialize path for incoming remote stroke
          if (ctx && msg.playerId !== myPlayerId) {
            ctx.beginPath();
            ctx.strokeStyle = msg.color || '#1a1a1a';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(msg.point.x, msg.point.y);
          }
        } else if (msg.type === 'STROKE_POINT') {
          // Continue remote stroke in real-time
          if (ctx && (!isDrawing || !isMyTurn)) {
            ctx.lineTo(msg.point.x, msg.point.y);
            ctx.stroke();
          }
        } else if (msg.type === 'STROKE_FINISH') {
          if (msg.stroke) {
            strokesRef.current.push(msg.stroke);
            if (ctx) {
              renderStroke(ctx, msg.stroke);
            }
          }
        }
      } catch (err) {
        console.error('Failed to handle message in GameCanvas:', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws, myPlayerId, isDrawing, isMyTurn, redrawAllStrokes, renderStroke]);

  // Coordinate normalizer scaling to internal 800x500 resolution
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX;
      clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY;
    }

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY)
    };
  };

  // Local drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || !ws || ws.readyState !== WebSocket.OPEN) return;
    setIsDrawing(true);
    const point = getCoordinates(e);

    // Broadcast stroke start
    ws.send(JSON.stringify({ type: 'DRAW_START', point }));

    // Instant local feedback
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = myColor;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(point.x, point.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isMyTurn || !ws || ws.readyState !== WebSocket.OPEN) return;
    const point = getCoordinates(e);

    // Broadcast stroke coordinate
    ws.send(JSON.stringify({ type: 'DRAW_MOVE', point }));

    // Instant local render
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !isMyTurn || !ws || ws.readyState !== WebSocket.OPEN) return;
    setIsDrawing(false);
    // Ending the stroke advances the turn on the backend
    ws.send(JSON.stringify({ type: 'DRAW_END' }));
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 max-w-7xl w-full mx-auto select-none">
      {/* Left / Center Main Canvas Card */}
      <div className="flex flex-col items-center bg-[#FAF8F5] p-5 md:p-7 rounded-3xl border-4 border-[#1a1a1a] shadow-[0_12px_0_rgba(0,0,0,1)] w-full max-w-4xl flex-1">
        {/* Top Status Bar */}
        <div className="flex flex-wrap justify-between w-full items-center gap-3 mb-4">
          {/* Round Badge */}
          <div className="bg-[#FFE66D] text-[#1a1a1a] font-black text-lg md:text-xl px-4 py-2 rounded-2xl border-3 border-[#1a1a1a] shadow-[2px_3px_0px_#1a1a1a]">
            {phase === 'DRAWING_R1' ? 'ROUND 1 / 2' : 'ROUND 2 / 2'}
          </div>

          {/* Turn Status Pill */}
          <div
            className={`flex items-center gap-2 text-base md:text-lg font-black px-4 py-2 rounded-2xl border-3 border-[#1a1a1a] shadow-[2px_3px_0px_#1a1a1a] transition-all ${
              isMyTurn
                ? 'bg-[#7CD942] text-white animate-pulse'
                : 'bg-white text-[#1a1a1a]'
            }`}
          >
            {activePlayer?.color && (
              <span
                className="w-3.5 h-3.5 rounded-full border-2 border-[#1a1a1a] inline-block shadow-sm"
                style={{ backgroundColor: activePlayer.color }}
              />
            )}
            <span>
              {isMyTurn
                ? '🎨 YOUR TURN TO DRAW!'
                : `${activePlayer?.name || 'Someone'} is drawing...`}
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1.5 bg-[#FF6B6B] text-white font-black text-lg md:text-xl px-4 py-2 rounded-2xl border-3 border-[#1a1a1a] shadow-[2px_3px_0px_#1a1a1a]">
            <span>⏱</span>
            <span>{timeLeft !== null ? `${timeLeft}s` : '--'}</span>
          </div>
        </div>

        {/* Players Palette / Turn Indicator Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full bg-white/80 p-2.5 rounded-2xl border-2 border-[#1a1a1a] mb-4 shadow-inner">
          {players.map((p) => {
            const isActive = p.id === activePlayerId;
            const isMe = p.id === myPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-[#1a1a1a] bg-[#FFE66D] shadow-[2px_2px_0px_#1a1a1a] scale-105 font-black'
                    : 'border-transparent bg-gray-100/80 font-bold opacity-80'
                }`}
              >
                {p.avatar && (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-black">
                    <Image src={p.avatar} alt={p.name} fill className="object-cover" unoptimized />
                  </div>
                )}
                <span
                  className="w-3 h-3 rounded-full border border-black shadow-sm"
                  style={{ backgroundColor: p.color || '#999' }}
                />
                <span className="text-xs md:text-sm text-[#1a1a1a]">
                  {p.name} {isMe ? '(You)' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* The Drawing Canvas Area */}
        <div className="relative w-full max-w-[800px] aspect-[8/5] rounded-2xl border-4 border-[#1a1a1a] overflow-hidden bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full touch-none cursor-crosshair block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
          />

          {/* Spectator / Not-My-Turn Overlay */}
          {!isMyTurn && (
            <div
              className="absolute inset-0 z-10 cursor-not-allowed bg-black/5 flex items-center justify-center"
              title="Wait for your turn to draw"
            />
          )}
        </div>

        {/* Footer Instructions */}
        <div className="mt-3 text-center">
          <p className="text-[#1a1a1a] font-bold text-sm md:text-base">
            {isMyTurn ? (
              <span className="text-[#059669]">
                ✏️ Draw <strong>one single continuous stroke</strong>! Releasing mouse/touch ends your turn.
              </span>
            ) : (
              <span className="text-gray-600">
                👀 Watch carefully! One player is the <strong>Fake Artist</strong> trying to blend in...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Right Secret Topic & Word Card */}
      <div className="flex flex-col justify-between bg-[#FAF8F5] p-5 rounded-3xl border-4 border-[#1a1a1a] shadow-[0_12px_0_rgba(0,0,0,1)] w-full lg:w-72 xl:w-80 shrink-0 relative">
        {/* Top Paper Tape Simulation */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffeaa7]/90 border-2 border-[#1a1a1a] px-6 py-1 rounded shadow-sm text-[10px] font-black tracking-widest text-[#2d3436] uppercase rotate-[-2deg]">
          CONFIDENTIAL
        </div>

        <div>
          {/* Card Header & Role Badge */}
          <div className="text-center mt-2 mb-4">
            <h3 className="text-xl font-black text-[#1a1a1a] mb-2 tracking-wide">
              YOUR SECRET CARD
            </h3>

            {isFakeArtist ? (
              <div className="bg-[#EE4D4D] text-white font-black py-1.5 px-3 rounded-xl border-3 border-[#1a1a1a] shadow-[2px_3px_0px_#1a1a1a] text-base flex items-center justify-center gap-2 animate-pulse">
                <span>🕵️</span>
                <span>FAKE ARTIST</span>
              </div>
            ) : (
              <div className="bg-[#4ECDC4] text-[#1a1a1a] font-black py-1.5 px-3 rounded-xl border-3 border-[#1a1a1a] shadow-[2px_3px_0px_#1a1a1a] text-base flex items-center justify-center gap-2">
                <span>🎨</span>
                <span>REAL ARTIST</span>
              </div>
            )}
          </div>

          {/* Category Section */}
          <div className="bg-white p-3.5 rounded-2xl border-3 border-[#1a1a1a] shadow-[2px_3px_0px_#1a1a1a] mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block mb-1">
              Category
            </span>
            <div className="text-lg md:text-xl font-black text-[#674ea7] flex items-center gap-1.5">
              <span>🏷️</span>
              <span>{roleInfo?.category || 'General'}</span>
            </div>
          </div>

          {/* Secret Word Section */}
          <div className="bg-white p-3.5 rounded-2xl border-3 border-[#1a1a1a] shadow-[2px_3px_0px_#1a1a1a]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block mb-1.5">
              Secret Word
            </span>

            {!isFakeArtist && secretWord ? (
              /* Real Artist View: Crisp and Clear Word */
              <div>
                <div className="bg-[#7CD942] text-white p-3.5 rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] text-center">
                  <div className="text-2xl md:text-3xl font-black tracking-wide break-words drop-shadow-sm">
                    {secretWord}
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-bold mt-2 text-center leading-tight">
                  ✨ Draw subtle hints! Don&apos;t make it too obvious or the Fake Artist will guess it.
                </p>
              </div>
            ) : (
              /* Fake Artist View: Hazy / Blurred Mystery Word Box */
              <div>
                <div className="relative bg-neutral-900 p-3.5 rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] text-center overflow-hidden flex flex-col items-center justify-center min-h-[72px]">
                  {/* Hazy blurred underlying text effect */}
                  <div className="absolute inset-0 filter blur-sm select-none opacity-30 flex items-center justify-center text-3xl font-mono tracking-widest text-neutral-300">
                    HIDDEN
                  </div>
                  {/* Foggy / Redacted Badge */}
                  <div className="relative z-10 flex items-center gap-1.5 text-[#FF6B6B] font-black text-lg tracking-widest animate-pulse">
                    <span>🔒</span>
                    <span>? ? ? ? ?</span>
                  </div>
                  <span className="relative z-10 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                    Word Redacted
                  </span>
                </div>
                <p className="text-xs text-[#EE4D4D] font-extrabold mt-2 text-center leading-tight">
                  🕵️ You don&apos;t know the word! Pretend you do, study other strokes, and guess the word at the end!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Rule Reminder Card */}
        <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 text-center">
          <p className="text-[11px] font-bold text-gray-500">
            📌 1 continuous stroke per turn. Lifting mouse/touch passes turn!
          </p>
        </div>
      </div>
    </div>
  );
}
