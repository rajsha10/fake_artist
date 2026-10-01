'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-10 px-4 border-t-2 border-[#1a1a1a] bg-[#FAF8F5]/90 text-center relative z-10">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-2 text-xl font-black text-[#1a1a1a] footer-brand">
          <span>🎨</span>
          <span className="footer-title">Fake Artist Studio</span>
          <span>✏️</span>
        </div>
        
        <p className="text-xs sm:text-sm text-[#4B5563] font-bold">
          A real-time collaborative social deduction drawing game inspired by &ldquo;A Fake Artist Goes to New York&rdquo;.
        </p>

        <div className="flex items-center justify-center gap-6 text-xs font-black text-[#1a1a1a] pt-2 footer-links">
          <a href="#how-to-play" className="hover:text-[#EE4D4D] transition-colors">
            Game Rules
          </a>
          <span>•</span>
          <a href="#" className="hover:text-[#45B4EA] transition-colors">
            Create Room
          </a>
          <span>•</span>
          <a href="#" className="hover:text-[#7CD942] transition-colors">
            Categories
          </a>
        </div>

        <div className="text-[11px] font-bold text-[#9CA3AF] pt-2">
          © {new Date().getFullYear()} Fake Artist. Hand-crafted with Next.js &amp; WebSockets.
        </div>
      </div>

      <style>{`
        @font-face {
          font-family: 'CfCrayons';
          src: url('/fonts/CfCrayonsRegular-2Gl3.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .footer-title {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          letter-spacing: 0.04em;
        }

        .footer-links {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          letter-spacing: 0.03em;
        }
      `}</style>
    </footer>
  );
}
