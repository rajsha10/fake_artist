'use client';

import React, { useState, useEffect, useRef } from 'react';

interface JoinGameProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string, nickname: string) => void;
}

/**
 * useKeyboardOffset
 * Tracks the bottom offset caused by the software keyboard via the
 * visualViewport API. Returns the number of px the keyboard is covering
 * from the bottom of the layout viewport.
 */
function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // keyboard height = layout height - (vv.height + vv.offsetTop)
      const keyboardHeight =
        window.innerHeight - (vv.height + vv.offsetTop);
      setOffset(Math.max(0, keyboardHeight));
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}

export default function JoinGame({ isOpen, onClose, onJoin }: JoinGameProps) {
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const keyboardOffset = useKeyboardOffset();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && nickname.trim()) {
      onJoin(roomCode.trim().toUpperCase(), nickname.trim());
    }
  };

  return (
    /*
     * Backdrop: fixed to the FULL layout viewport.
     * We DON'T use items-end here — instead the card is given an explicit
     * `bottom` offset that equals the keyboard height, so it always
     * floats just above the keyboard regardless of platform.
     */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-fadeIn"
      style={{ paddingBottom: keyboardOffset }}
    >
      {/* Backdrop tap-to-close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Card — bottom-sheet on mobile, rounded fully on sm+ */}
      <div
        className="relative w-full max-w-[440px] bg-white rounded-t-2xl sm:rounded-2xl border-[3.5px] border-[#1a1a1a] shadow-[0_-4px_32px_rgba(0,0,0,0.22)] p-6 sm:p-8 z-10 select-none animate-scaleUp overflow-y-auto"
        style={{
          fontFamily: "'CfCrayons', cursive, sans-serif",
          /* never taller than the visible area above the keyboard */
          maxHeight: `calc(100dvh - ${keyboardOffset}px - 8px)`,
          transition: 'max-height 0.2s ease, padding-bottom 0.2s ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-black transition-colors"
          title="Close"
        >
          ✕
        </button>

        {/* ── Doodle decorations ── */}

        {/* Top-Left: Hollow Star */}
        <svg
          className="absolute top-4 left-5 w-7 h-7 text-[#1a1a1a] pointer-events-none -rotate-12"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Top-Left: Yellow Star */}
        <svg
          className="absolute top-14 left-7 w-6 h-6 pointer-events-none rotate-12"
          viewBox="0 0 24 24" fill="#FDE047" stroke="#1a1a1a"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Top-Right: Hollow Star */}
        <svg
          className="absolute top-4 right-14 w-7 h-7 text-[#1a1a1a] pointer-events-none rotate-12"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Top-Right: Curved Arrow */}
        <svg
          className="absolute top-14 right-6 w-8 h-10 pointer-events-none text-[#1a1a1a]"
          viewBox="0 0 40 50" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M 8 10 C 25 8, 32 20, 26 42" />
          <path d="M 18 36 L 26 44 L 32 34" />
        </svg>

        {/* Bottom-Left: Spiral */}
        <svg
          className="absolute bottom-6 left-5 w-10 h-12 pointer-events-none text-[#1a1a1a]"
          viewBox="0 0 45 55" fill="none" stroke="currentColor"
          strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M 12 14 C 2 30, 22 50, 28 35 C 32 24, 18 20, 20 28 C 24 38, 38 42, 40 40" />
          <path d="M 33 44 L 41 40 L 41 32" />
        </svg>

        {/* Bottom-Right: Blue Star */}
        <svg
          className="absolute bottom-8 right-7 w-7 h-7 pointer-events-none rotate-12"
          viewBox="0 0 24 24" fill="#93C5FD" stroke="#1a1a1a"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* ── Form Content ── */}
        <div className="flex flex-col items-center">
          {/* Header with crayon highlight */}
          <div className="relative inline-block mt-1 mb-5">
            <svg
              className="absolute -inset-x-6 -inset-y-2 w-[calc(100%+48px)] h-[calc(100%+16px)] pointer-events-none -z-0 opacity-85"
              viewBox="0 0 220 50" preserveAspectRatio="none" fill="none"
            >
              <path
                d="M 10 25 Q 50 10 110 26 Q 170 38 210 22 Q 170 8 110 18 Q 50 28 15 20 Q 80 34 160 28 Q 200 24 215 32"
                stroke="#FDE047" strokeWidth="28" strokeLinecap="round"
                strokeLinejoin="round" style={{ opacity: 0.85 }}
              />
            </svg>
            <h2 className="relative z-10 text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight">
              Join a Game
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-1">
            {/* Room Code */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <label htmlFor="roomCodeInput" className="text-lg sm:text-xl font-bold text-[#1a1a1a]">
                Room Code
              </label>
              <div className="w-full max-w-[320px]">
                <input
                  id="roomCodeInput"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="K9X2"
                  className="w-full text-center text-2xl sm:text-3xl font-black text-[#1a1a1a] py-2 px-3 border-[3px] border-[#1a1a1a] rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-300 uppercase tracking-widest transition-all"
                  style={{ boxShadow: 'inset 0px 4px 6px rgba(0,0,0,0.25)', backgroundColor: '#ffffff' }}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Nickname */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <label htmlFor="nicknameInput" className="text-lg sm:text-xl font-bold text-[#1a1a1a]">
                Nickname
              </label>
              <div className="w-full max-w-[320px]">
                <input
                  id="nicknameInput"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Player1"
                  className="w-full text-center text-xl sm:text-2xl font-bold text-[#1a1a1a] py-2 px-3 border-[3px] border-[#1a1a1a] rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-300 tracking-wide transition-all"
                  style={{ boxShadow: 'inset 0px 4px 6px rgba(0,0,0,0.25)', backgroundColor: '#ffffff' }}
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* JOIN button */}
            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                className="relative bg-[#68E034] hover:bg-[#5cd42c] active:bg-[#4eb822] text-[#1a1a1a] text-2xl sm:text-3xl font-black tracking-wider py-2.5 px-10 border-[3.5px] border-[#1a1a1a] rounded-2xl transition-all cursor-pointer"
                style={{ boxShadow: '0px 6px 0px #1a1a1a', transform: 'translateY(0px)' }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0px 2px 0px #1a1a1a'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0px 6px 0px #1a1a1a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0px 6px 0px #1a1a1a'; }}
              >
                JOIN!
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
