'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import JoinGame from '@/components/Game/JoinGame';
import CreateGame from '@/components/Game/CreateGame';

function DoodleQuestionMark({
  className,
  color = '#4CAF50',
  style,
}: {
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 65 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M 18 26 C 16 12 28 4 40 4 C 54 4 61 14 61 26 C 61 36 53 44 47 50 C 42 55 39 60 39 67 C 39 69 36 71 34 71 C 31 71 28 69 28 67 C 28 57 34 50 39 45 C 44 40 49 35 49 26 C 49 18 44 12 38 12 C 31 12 26 17 26 25 C 26 28 23 30 20 29 C 18.5 28.5 18 27.5 18 26 Z"
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx="33.5"
        cy="81.5"
        r="5.5"
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="3.2"
      />
    </svg>
  );
}

export default function Hero() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleJoinGame = (roomCode: string, nickname: string) => {
    window.location.href = `/lobby?code=${roomCode.toUpperCase()}&name=${encodeURIComponent(nickname)}`;
  };

  const handleCreateGame = (roomCode: string, nickname: string) => {
    window.location.href = `/lobby?code=${roomCode.toUpperCase()}&name=${encodeURIComponent(nickname)}`;
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ width: '100vw', height: '100dvh' }}
    >
      {/* ── Background: full-cover notebook paper ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/background.webp"
          alt="Notebook paper background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* ── Content layer ── */}
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto px-4"
        style={{ height: '100%', justifyContent: 'space-evenly' }}
      >

        {/* ── Title: FAKE ARTIST + Stars, Underline & Question Mark ── */}
        <div className="hero-title-wrapper">

          {/* Top-left hollow sketch star */}
          <svg className="deco-star star-tl" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M30 4 L34 24 L54 24 L38 36 L44 56 L30 44 L16 56 L22 36 L6 24 L26 24 Z"
              stroke="#444" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
          </svg>

          {/* Top-right hollow sketch star */}
          <svg className="deco-star star-tr" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M30 4 L34 24 L54 24 L38 36 L44 56 L30 44 L16 56 L22 36 L6 24 L26 24 Z"
              stroke="#444" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
          </svg>

          {/* Small yellow filled star — left mid */}
          <svg className="deco-star star-yl" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M25 4 L29 19 L44 19 L32 28 L37 43 L25 34 L13 43 L18 28 L6 19 L21 19 Z"
              fill="#F5D800" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
          </svg>

          {/* Small yellow filled star — right mid */}
          <svg className="deco-star star-yr" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M25 4 L29 19 L44 19 L32 28 L37 43 L25 34 L13 43 L18 28 L6 19 L21 19 Z"
              fill="#F5D800" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
          </svg>

          {/* Purple question mark next to title */}
          <DoodleQuestionMark
            className="deco-qmark title-qmark-purple"
            color="#A855F7"
          />

          {/* Main Title Heading */}
          <div className="title-heading-box">
            <h1 className="hero-title" aria-label="Fake Artist">
              <span className="letter" style={{ color: '#EE4D4D' }}>F</span>
              <span className="letter" style={{ color: '#F69E4C' }}>A</span>
              <span className="letter" style={{ color: '#7CD942' }}>K</span>
              <span className="letter" style={{ color: '#45B4EA' }}>E</span>
              <span className="letter-space">&nbsp;</span>
              <span className="letter" style={{ color: '#A6D83B' }}>A</span>
              <span className="letter" style={{ color: '#45B4EA' }}>R</span>
              <span className="letter" style={{ color: '#9C42D8' }}>T</span>
              <span className="letter" style={{ color: '#7A3BE3' }}>I</span>
              <span className="letter" style={{ color: '#45B4EA' }}>S</span>
              <span className="letter" style={{ color: '#9C42D8' }}>T</span>
            </h1>

            {/* Hand-drawn double sketch underline under FAKE ARTIST */}
            <svg
              className="hero-title-underline"
              viewBox="0 0 520 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M 15 24 Q 260 34 505 18"
                stroke="#1a1a1a"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M 35 30 Q 260 38 485 24"
                stroke="#1a1a1a"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* ── Characters section: 3D Depth + Multi-layer Ground Shadows + Floating Question Marks ── */}
        <div className="chars-section">

          {/* Floating question marks around characters matching reference with 3D shadows */}
          {/* Left side: Pink/Red ? + Purple ? */}
          <DoodleQuestionMark className="char-qmark cqm-pink"   color="#F472B6" />
          <DoodleQuestionMark className="char-qmark cqm-purple" color="#A855F7" />

          {/* Above Green character: Double Green ?? */}
          <DoodleQuestionMark className="char-qmark cqm-green1" color="#4ADE80" />
          <DoodleQuestionMark className="char-qmark cqm-green2" color="#4ADE80" />

          {/* Right side: Blue ? */}
          <DoodleQuestionMark className="char-qmark cqm-blue"   color="#38BDF8" />

          {/* Characters 3D container & Layered Ground Shadows */}
          <div className="characters-wrapper">
            <Image
              src="/assets/characters.webp"
              alt="Four cartoon bird characters holding paper signs"
              width={840}
              height={349}
              priority
              className="characters-img"
            />
          </div>

        </div>

        {/* ── Hero Buttons ── */}
        <div className="hero-btns-container">
          <div className="hero-btns-row">

            {/* Green curved arrow — left */}
            <svg className="btn-arrow arrow-left" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M50 10 C30 10, 8 30, 12 65" stroke="#4CAF50" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <path d="M6 58 L12 68 L20 60" stroke="#4CAF50" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>

            <button 
              className="hero-btn btn-green"
              onClick={() => setIsJoinModalOpen(true)}
            >
              JOIN GAME
            </button>
            
            {/* Middle button with blue bottom arrow */}
            <div className="btn-center-wrapper">
              <button 
                className="hero-btn btn-blue"
                onClick={() => setIsCreateModalOpen(true)}
              >
                CREATE ROOM
              </button>
              {/* Blue curved arrow curving under CREATE ROOM pointing up-right */}
              <svg className="btn-arrow-bottom" viewBox="0 0 70 35" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M 10 12 C 22 30, 50 28, 62 10" stroke="#38BDF8" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                <path d="M 50 8 L 63 10 L 60 22" stroke="#38BDF8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>

            <button className="hero-btn btn-yellow">HOW TO PLAY</button>

            {/* Yellow curved arrow — right */}
            <svg className="btn-arrow arrow-right" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 10 C30 10, 52 30, 48 65" stroke="#D4C500" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <path d="M54 58 L48 68 L40 60" stroke="#D4C500" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>

          </div>
        </div>

        {/* ── Join Game Modal Popup ── */}
        <JoinGame
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={handleJoinGame}
        />

        {/* ── Create Game Modal Popup ── */}
        <CreateGame
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateGame}
        />

      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        @font-face {
          font-family: 'CfCrayons';
          src: url('/fonts/CfCrayonsRegular-2Gl3.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        /* ── Title ── */
        .hero-title-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(0.8rem, 2vh, 1.8rem) clamp(2.5rem, 6vw, 5.5rem) 0;
          flex-shrink: 0;
        }

        .title-heading-box {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-title {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          font-size: clamp(2.2rem, 6vw, 5.2rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0.03em;
          display: flex;
          align-items: flex-end;
          filter: drop-shadow(2px 3px 0px rgba(0,0,0,0.18)) drop-shadow(0px 8px 16px rgba(0,0,0,0.12));
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        .hero-title-underline {
          width: 106%;
          max-width: 540px;
          height: auto;
          margin-top: -8px;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }

        .letter {
          display: inline-block;
          -webkit-text-stroke: 2.5px #1a1a1a;
          paint-order: stroke fill;
          position: relative;
        }

        /*
          Arc curve: subtle parabola with peak at centre.
          Layout order in h1:
            1=F  2=A  3=K  4=E  5=space  6=A  7=R  8=T  9=I  10=S  11=T
        */
        .hero-title > span:nth-child(1)  { transform: rotate(-2.0deg) translateY(  0px); }
        .hero-title > span:nth-child(2)  { transform: rotate( 1.8deg) translateY( -6px); }
        .hero-title > span:nth-child(3)  { transform: rotate(-1.5deg) translateY(-11px); }
        .hero-title > span:nth-child(4)  { transform: rotate( 2.2deg) translateY(-14px); }
        /* space: nth-child 5 */
        .hero-title > span:nth-child(6)  { transform: rotate(-1.0deg) translateY(-15px); }
        .hero-title > span:nth-child(7)  { transform: rotate( 2.0deg) translateY(-15px); }
        .hero-title > span:nth-child(8)  { transform: rotate(-1.8deg) translateY(-13px); }
        .hero-title > span:nth-child(9)  { transform: rotate( 1.5deg) translateY(-10px); }
        .hero-title > span:nth-child(10) { transform: rotate(-1.5deg) translateY( -6px); }
        .hero-title > span:nth-child(11) { transform: rotate( 2.0deg) translateY( -2px); }

        .letter-space { display: inline-block; width: 0.25em; }

        /* ── Decorative stars ── */
        .deco-star {
          position: absolute;
          pointer-events: none;
          user-select: none;
          z-index: 5;
          filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.15));
        }

        /* Hollow sketch star – top left */
        .star-tl {
          width: clamp(30px, 4.5vw, 48px);
          top: -2px;
          left: clamp(2px, 1vw, 15px);
          transform-origin: center center;
          animation: pulse-float 3.2s ease-in-out infinite;
          animation-delay: 0s;
        }

        /* Hollow sketch star – top right */
        .star-tr {
          width: clamp(28px, 4.2vw, 44px);
          top: 0px;
          right: clamp(6px, 1.5vw, 22px);
          transform-origin: center center;
          animation: pulse-float-alt 2.8s ease-in-out infinite;
          animation-delay: 0.6s;
        }

        /* Yellow filled star – left mid */
        .star-yl {
          width: clamp(26px, 3.8vw, 40px);
          bottom: clamp(6px, 1.5vh, 16px);
          left: clamp(10px, 2.8vw, 32px);
          transform-origin: center center;
          animation: pulse-float 3.6s ease-in-out infinite;
          animation-delay: 1.1s;
        }

        /* Yellow filled star – right mid */
        .star-yr {
          width: clamp(26px, 3.8vw, 40px);
          bottom: clamp(6px, 1.5vh, 16px);
          right: clamp(10px, 2.8vw, 32px);
          transform-origin: center center;
          animation: pulse-float-alt 2.5s ease-in-out infinite;
          animation-delay: 0.3s;
        }

        /* ── Title Question Mark ── */
        .title-qmark-purple {
          position: absolute;
          width: clamp(28px, 4.8vw, 50px);
          right: clamp(35px, 6vw, 65px);
          top: clamp(-8px, -0.5vh, 4px);
          pointer-events: none;
          user-select: none;
          z-index: 5;
          transform-origin: center bottom;
          filter: drop-shadow(1px 3px 0px rgba(0,0,0,0.18)) drop-shadow(0px 6px 10px rgba(0,0,0,0.15));
          animation: wobble-qmark-alt 2.8s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        /* ── Keyframes ── */
        @keyframes pulse-float {
          0%   { transform: rotate(-10deg) scale(0.88) translateY(0px);   }
          30%  { transform: rotate(-8deg)  scale(1.10) translateY(-5px);  }
          60%  { transform: rotate(-12deg) scale(0.95) translateY(-2px);  }
          100% { transform: rotate(-10deg) scale(0.88) translateY(0px);   }
        }

        @keyframes pulse-float-alt {
          0%   { transform: rotate(14deg)  scale(0.90) translateY(0px);   }
          35%  { transform: rotate(10deg)  scale(1.12) translateY(-6px);  }
          65%  { transform: rotate(16deg)  scale(0.94) translateY(-2px);  }
          100% { transform: rotate(14deg)  scale(0.90) translateY(0px);   }
        }

        @keyframes wobble-qmark {
          0%   { transform: rotate(-12deg) scale(0.90) translateY(0px); }
          30%  { transform: rotate(-6deg)  scale(1.12) translateY(-4px); }
          65%  { transform: rotate(-14deg) scale(0.96) translateY(-1px); }
          100% { transform: rotate(-12deg) scale(0.90) translateY(0px); }
        }

        @keyframes wobble-qmark-alt {
          0%   { transform: rotate(14deg)  scale(0.90) translateY(0px); }
          35%  { transform: rotate(8deg)   scale(1.14) translateY(-5px); }
          70%  { transform: rotate(16deg)  scale(0.95) translateY(-2px); }
          100% { transform: rotate(14deg)  scale(0.90) translateY(0px); }
        }

        /* ── Characters section outer wrapper ── */
        .chars-section {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          max-width: 860px;
          flex-shrink: 1;
          padding-top: clamp(0.5rem, 2vh, 1.8rem);
        }

        /* ── Floating question marks around characters ── */
        .char-qmark {
          position: absolute;
          pointer-events: none;
          user-select: none;
          z-index: 20;
          transform-origin: center bottom;
          filter: drop-shadow(2px 3px 0px rgba(0,0,0,0.18)) drop-shadow(0px 8px 14px rgba(0,0,0,0.22));
        }

        /* Pink/Coral ? – left side lower */
        .cqm-pink {
          width: clamp(22px, 3.4vw, 36px);
          left: clamp(2%, 4%, 6%);
          top: 48%;
          animation: wobble-qmark 2.4s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        /* Purple ? – left side upper */
        .cqm-purple {
          width: clamp(24px, 3.8vw, 40px);
          left: clamp(6%, 8%, 11%);
          top: 24%;
          animation: wobble-qmark-alt 3.1s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        /* Green ? – center-left, above green character */
        .cqm-green1 {
          width: clamp(28px, 4.4vw, 46px);
          left: clamp(40%, 42%, 44%);
          top: clamp(-20px, -2.5vh, -8px);
          animation: wobble-qmark 2.8s ease-in-out infinite;
          animation-delay: 0s;
        }

        /* Green ? – center-right, slightly lower */
        .cqm-green2 {
          width: clamp(18px, 2.8vw, 32px);
          left: clamp(49%, 50.5%, 52%);
          top: clamp(-10px, -1.2vh, 0px);
          animation: wobble-qmark-alt 3.4s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        /* Blue ? – right side */
        .cqm-blue {
          width: clamp(24px, 3.8vw, 40px);
          right: clamp(3%, 5%, 8%);
          top: 26%;
          animation: wobble-qmark 2.6s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        /* ── Characters image wrapper (inner) ── */
        .characters-wrapper {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          flex-shrink: 1;
          padding-bottom: 8px;
        }

        /* ── Multi-tier 3D Ground Shadows ── */
        
        /* 1. Sharp dark contact shadow right beneath the bottom of the signs */
        .ground-shadow-contact {
          position: absolute;
          bottom: 1px;
          left: 50%;
          transform: translateX(-50%);
          width: 86%;
          height: 14px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 80%);
          filter: blur(4px);
        }

        /* 2. Mid diffusion shadow spreading softly outward */
        .ground-shadow-mid {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 93%;
          height: 30px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 60%, transparent 85%);
          filter: blur(12px);
        }

        /* 3. Deep ambient ground occlusion glow */
        .ground-shadow-ambient {
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 52px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.08) 65%, transparent 90%);
          filter: blur(24px);
        }

        /* ── Characters 3D Image ── */
        .characters-img {
          position: relative;
          z-index: 1;
          width: auto;
          height: auto;
          max-height: 43vh;
          max-width: 100%;
          object-fit: contain;
          filter:
            drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.55))
            drop-shadow(0px 8px 14px rgba(0, 0, 0, 0.38))
            drop-shadow(0px 22px 28px rgba(0, 0, 0, 0.24))
            drop-shadow(0px 40px 50px rgba(0, 0, 0, 0.15));
          transform: perspective(1200px) rotateX(1.8deg);
          transform-origin: bottom center;
          animation: character-breathe 5s ease-in-out infinite;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.35s ease;
        }

        .characters-wrapper:hover .characters-img {
          transform: perspective(1200px) rotateX(0deg) translateY(-6px) scale(1.018);
          filter:
            drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.6))
            drop-shadow(0px 14px 20px rgba(0, 0, 0, 0.42))
            drop-shadow(0px 32px 38px rgba(0, 0, 0, 0.28))
            drop-shadow(0px 52px 60px rgba(0, 0, 0, 0.18));
        }

        @keyframes character-breathe {
          0%   { transform: perspective(1200px) rotateX(1.8deg) translateY(0px) scale(1); }
          50%  { transform: perspective(1200px) rotateX(1.2deg) translateY(-5px) scale(1.012); }
          100% { transform: perspective(1200px) rotateX(1.8deg) translateY(0px) scale(1); }
        }

        /* ── Hero Buttons ── */
        .hero-btns-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          padding-bottom: clamp(6px, 1.8vh, 16px);
        }

        .hero-btns-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(10px, 1.8vw, 22px);
          position: relative;
        }

        .btn-center-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-btn {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          font-size: clamp(0.82rem, 1.25vw, 1.05rem);
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #1a1a1a;
          padding: clamp(6px, 1.1vh, 10px) clamp(18px, 2.4vw, 32px);
          border-radius: 9999px;
          border: 2.5px solid #1a1a1a;
          box-shadow: 0 0 0 2px #ffffff, 2.5px 3.5px 0px 2px #1a1a1a, 0 8px 16px rgba(0,0,0,0.18);
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .hero-btn:hover {
          transform: translate(-1.5px, -2.5px);
          box-shadow: 0 0 0 2px #ffffff, 4px 5.5px 0px 2px #1a1a1a, 0 12px 20px rgba(0,0,0,0.22);
        }

        .hero-btn:active {
          transform: translate(1.5px, 1.5px);
          box-shadow: 0 0 0 2px #ffffff, 1px 1.5px 0px 2px #1a1a1a, 0 4px 8px rgba(0,0,0,0.15);
        }

        .btn-green  { background: #6FCF3A; }
        .btn-blue   { background: #4BBCF5; }
        .btn-yellow { background: #F5E442; }

        /* Decorative curved arrows */
        .btn-arrow {
          width: clamp(22px, 3.2vw, 40px);
          height: auto;
          flex-shrink: 0;
          pointer-events: none;
          user-select: none;
          filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.15));
        }

        .arrow-left  { margin-right: clamp(1px, 0.5vw, 4px); }
        .arrow-right { margin-left:  clamp(1px, 0.5vw, 4px); }

        .btn-arrow-bottom {
          position: absolute;
          bottom: -22px;
          right: -18px;
          width: clamp(28px, 4vw, 48px);
          height: auto;
          pointer-events: none;
          user-select: none;
          filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.15));
        }

        /* Short screens: shrink further */
        @media (max-height: 650px) {
          .characters-img { max-height: 34vh; }
          .hero-title { font-size: clamp(1.8rem, 4.8vw, 3.8rem); }
          .btn-arrow-bottom { bottom: -16px; width: 24px; }
        }

        @media (max-width: 560px) {
          .btn-arrow { display: none; }
          .btn-arrow-bottom { display: none; }
          .hero-btns-row { gap: 8px; }
        }
      `}</style>
    </section>
  );
}
