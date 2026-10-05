'use client';

import React, { useState } from 'react';

interface CreateGameProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roomCode: string, nickname: string) => void;
}

export default function CreateGame({ isOpen, onClose, onCreate }: CreateGameProps) {
  const [nickname, setNickname] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      onCreate(generatedCode, nickname.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose} 
        aria-label="Close modal"
      />

      {/* Popup Card */}
      <div 
        className="relative w-full max-w-[440px] bg-white rounded-2xl border-[3.5px] border-[#1a1a1a] shadow-[0_12px_32px_rgba(0,0,0,0.25)] p-7 sm:p-8 z-10 select-none animate-scaleUp"
        style={{ fontFamily: "'CfCrayons', cursive, sans-serif" }}
      >
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-black transition-colors"
          title="Close"
        >
          ✕
        </button>

        {/* Top-Left: Hollow Star */}
        <svg 
          className="absolute top-4 left-5 w-7 h-7 text-[#1a1a1a] pointer-events-none -rotate-12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Top-Left: Yellow Star */}
        <svg 
          className="absolute top-14 left-7 w-6 h-6 pointer-events-none rotate-12" 
          viewBox="0 0 24 24" 
          fill="#FDE047" 
          stroke="#1a1a1a" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Top-Right: Hollow Star */}
        <svg 
          className="absolute top-4 right-14 w-7 h-7 text-[#1a1a1a] pointer-events-none rotate-12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Top-Right: Curved Arrow */}
        <svg 
          className="absolute top-14 right-6 w-8 h-10 pointer-events-none text-[#1a1a1a]" 
          viewBox="0 0 40 50" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M 8 10 C 25 8, 32 20, 26 42" />
          <path d="M 18 36 L 26 44 L 32 34" />
        </svg>

        {/* Bottom-Left: Spiral / Loop Doodle */}
        <svg 
          className="absolute bottom-6 left-5 w-10 h-12 pointer-events-none text-[#1a1a1a]" 
          viewBox="0 0 45 55" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M 12 14 C 2 30, 22 50, 28 35 C 32 24, 18 20, 20 28 C 24 38, 38 42, 40 40" />
          <path d="M 33 44 L 41 40 L 41 32" />
        </svg>

        {/* Bottom-Right: Blue Star */}
        <svg 
          className="absolute bottom-8 right-7 w-7 h-7 pointer-events-none rotate-12" 
          viewBox="0 0 24 24" 
          fill="#93C5FD" 
          stroke="#1a1a1a" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Form Content */}
        <div className="flex flex-col items-center">
          {/* Header Title */}
          <div className="relative inline-block mt-1 mb-6">
            <svg 
              className="absolute -inset-x-6 -inset-y-2 w-[calc(100%+48px)] h-[calc(100%+16px)] pointer-events-none -z-0 opacity-85"
              viewBox="0 0 220 50" 
              preserveAspectRatio="none"
              fill="none"
            >
              <path 
                d="M 10 25 Q 50 10 110 26 Q 170 38 210 22 Q 170 8 110 18 Q 50 28 15 20 Q 80 34 160 28 Q 200 24 215 32" 
                stroke="#38BDF8" 
                strokeWidth="28" 
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.85 }}
              />
            </svg>
            
            <h2 className="relative z-10 text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight">
              Create a Room
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mt-1">
            {/* Nickname Field */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <label 
                htmlFor="createNicknameInput" 
                className="text-lg sm:text-xl font-bold text-[#1a1a1a]"
              >
                Your Nickname
              </label>
              <div className="w-full max-w-[320px]">
                <input
                  id="createNicknameInput"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="HostPlayer"
                  className="w-full text-center text-xl sm:text-2xl font-bold text-[#1a1a1a] py-2 px-3 border-[3px] border-[#1a1a1a] rounded-xl outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-300 tracking-wide transition-all"
                  style={{
                    boxShadow: 'inset 0px 4px 6px rgba(0, 0, 0, 0.25)',
                    backgroundColor: '#ffffff'
                  }}
                  maxLength={15}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* CREATE! Button */}
            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                className="relative bg-[#38BDF8] hover:bg-[#0ea5e9] active:bg-[#0284c7] text-[#1a1a1a] text-2xl sm:text-3xl font-black tracking-wider py-2.5 px-10 border-[3.5px] border-[#1a1a1a] rounded-2xl transition-all cursor-pointer"
                style={{
                  boxShadow: '0px 6px 0px #1a1a1a',
                  transform: 'translateY(0px)',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(4px)';
                  e.currentTarget.style.boxShadow = '0px 2px 0px #1a1a1a';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0px 6px 0px #1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0px 6px 0px #1a1a1a';
                }}
              >
                CREATE!
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
