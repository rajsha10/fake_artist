'use client';

import React from 'react';
import Image from 'next/image';

function DoodleStar({
  className,
  color = '#F5D800',
  style,
}: {
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M25 4 L29 19 L44 19 L32 28 L37 43 L25 34 L13 43 L18 28 L6 19 L21 19 Z"
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export default function Info() {
  const steps = [
    {
      number: '01',
      title: 'Secret Word Assigned',
      desc: 'Everyone receives the exact secret word (e.g. "Helicopter"), except ONE player who only sees the category ("Vehicles").',
      icon: '🤫',
      tagColor: '#6FCF3A',
      headerColor: '#166534',
      badgeBg: '#DCFCE7',
      borderColor: '#16A34A',
    },
    {
      number: '02',
      title: 'Draw Just One Line',
      desc: 'Each player gets 20 seconds to draw exactly ONE continuous stroke on the communal canvas. Fake artists must bluff and pretend!',
      icon: '✏️',
      tagColor: '#4BBCF5',
      headerColor: '#0369A1',
      badgeBg: '#E0F2FE',
      borderColor: '#0284C7',
    },
    {
      number: '03',
      title: 'Vote & Final Guess',
      desc: 'Discuss and point fingers! If the Fake Artist is caught, they get one final shot to guess the secret word and steal the win.',
      icon: '🕵️',
      tagColor: '#F5A623',
      headerColor: '#9A3412',
      badgeBg: '#FFEDD5',
      borderColor: '#EA580C',
    },
  ];

  const categories = [
    { name: 'Food & Drinks', emoji: '🍕', example: 'Pizza, Sushi, Taco', color: '#EE4D4D' },
    { name: 'Animals', emoji: '🦁', example: 'Elephant, Penguin, Shark', color: '#F69E4C' },
    { name: 'Everyday Objects', emoji: '🎸', example: 'Guitar, Clock, Camera', color: '#7CD942' },
    { name: 'Places & Landmarks', emoji: '🗼', example: 'Eiffel Tower, Pyramids', color: '#45B4EA' },
    { name: 'Vehicles', emoji: '🚀', example: 'Rocket, Submarine, Helicopter', color: '#9C42D8' },
    { name: 'Fashion & Style', emoji: '👑', example: 'Sunglasses, Crown, Hoodie', color: '#F5D800' },
  ];

  return (
    <div id="how-to-play" className="w-full relative selection:bg-yellow-200">
      
      {/* ── PANEL 1: How to play + 3 Steps (Flipped 180° vertically: scaleY(-1)) ── */}
      <section className="relative w-full py-12 sm:py-20 px-4 sm:px-6 md:px-8 overflow-hidden sm:min-h-[90vh] flex flex-col justify-center">
        {/* Background flipped vertically so top corner scribbles seamlessly meet Hero's bottom */}
        <div className="absolute inset-0 z-0 pointer-events-none transform -scale-y-100">
          <Image
            src="/assets/background.webp"
            alt="Notebook paper background flipped"
            fill
            priority
            className="object-cover object-center"
            quality={95}
          />
        </div>

        {/* Content layer */}
        <div className="relative z-10 max-w-5xl mx-auto w-full space-y-12">
          
          {/* Section Header */}
          <div className="text-center relative flex flex-col items-center">
            
            {/* Decorative Question mark on left */}
            <DoodleQuestionMark
              className="absolute left-4 -top-6 w-8 h-12 hidden sm:block animate-bounce"
              color="#A855F7"
              style={{ animationDuration: '3s' }}
            />
            {/* Decorative Star on right */}
            <DoodleStar
              className="absolute right-6 -top-4 w-9 h-9 hidden sm:block"
              color="#F5D800"
            />

            <div className="doodle-badge inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4">
              <span className="text-sm">✏️</span>
              <span className="doodle-badge-text text-xs tracking-wider uppercase font-black">
                Rules of the Game
              </span>
            </div>

            <h2 className="doodle-section-title">
              <span style={{ color: '#EE4D4D' }}>H</span>
              <span style={{ color: '#F69E4C' }}>O</span>
              <span style={{ color: '#7CD942' }}>W</span>
              <span>&nbsp;</span>
              <span style={{ color: '#45B4EA' }}>T</span>
              <span style={{ color: '#A6D83B' }}>O</span>
              <span>&nbsp;</span>
              <span style={{ color: '#9C42D8' }}>P</span>
              <span style={{ color: '#EE4D4D' }}>L</span>
              <span style={{ color: '#F69E4C' }}>A</span>
              <span style={{ color: '#45B4EA' }}>Y</span>
            </h2>

            <p className="doodle-subtitle max-w-xl mx-auto mt-3 text-sm sm:text-base font-bold text-[#374151]">
              Fast-paced, hilarious, and easy to pick up in 60 seconds with your friends or family.
            </p>

            {/* Doodle underline */}
            <svg
              className="w-48 sm:w-64 h-auto mt-2 pointer-events-none"
              viewBox="0 0 260 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 10 12 Q 130 18 250 8"
                stroke="#1a1a1a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 pt-4">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className="doodle-card group relative p-5 sm:p-7 flex flex-col justify-between"
                style={{
                  /* reduce tilt on mobile so cards don't clip inside the grid */
                  transform: idx === 0 ? 'rotate(-0.6deg)' : idx === 1 ? 'rotate(0.4deg)' : 'rotate(-0.4deg)',
                }}
              >
                {/* Top tape doodle effect */}
                <div className="doodle-tape" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl filter drop-shadow-sm">{step.icon}</span>
                    <span
                      className="doodle-step-pill"
                      style={{
                        backgroundColor: step.badgeBg,
                        borderColor: '#1a1a1a',
                        color: step.headerColor,
                      }}
                    >
                      STEP {step.number}
                    </span>
                  </div>

                  <h3 className="doodle-card-title text-xl font-black mb-2.5 text-[#1a1a1a]">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#4B5563] leading-relaxed font-semibold">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t-2 border-dashed border-[#E5E7EB] flex items-center justify-between text-xs font-black text-[#6B7280]">
                  <span>Fake Artist Bluff</span>
                  <span>⏱️ 20s turns</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PANEL 2: Roles Comparison & Categories (Straight orientation: scaleY(1)) ── */}
      <section className="relative w-full py-12 sm:py-20 px-4 sm:px-6 md:px-8 overflow-hidden sm:min-h-[90vh] flex flex-col justify-center border-t-2 border-dashed border-[#1a1a1a]/20">
        {/* Background straight so its top corner scribbles seamlessly meet Panel 1's bottom */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/assets/background.webp"
            alt="Notebook paper background straight"
            fill
            priority
            className="object-cover object-center"
            quality={95}
          />
        </div>

        {/* Content layer */}
        <div className="relative z-10 max-w-5xl mx-auto w-full space-y-16">
          
          {/* Roles Comparison Card */}
          <div className="doodle-paper-container p-5 sm:p-10 relative">
            <div className="doodle-pin" />

            <div className="text-center mb-8">
              <h3 className="doodle-panel-heading text-2xl sm:text-3xl md:text-4xl font-black text-[#1a1a1a]">
                The Two Sides of the Canvas
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#6B7280] mt-1">
                Will you deduce the imposter, or bluff your way to victory?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real Artists */}
              <div className="doodle-role-card bg-[#F0FDF4] border-2 border-[#1a1a1a] shadow-[3px_4px_0px_#1a1a1a] p-6 rounded-2xl relative space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">🎨</span>
                  <div>
                    <h4 className="doodle-role-title text-xl font-black text-[#15803D]">
                      Real Artists
                    </h4>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#16A34A]">
                      The Majority
                    </span>
                  </div>
                </div>

                <ul className="text-xs sm:text-sm text-[#14532D] space-y-2.5 font-bold leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#16A34A] text-base">✓</span>
                    <span>Know the exact secret word & broad category.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#16A34A] text-base">✓</span>
                    <span>Draw clever, subtle clues so teammates trust you.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#DC2626] text-base">⚠️</span>
                    <span>Don't make it too obvious or the Fake Artist will guess the word!</span>
                  </li>
                </ul>
              </div>

              {/* Fake Artist */}
              <div className="doodle-role-card bg-[#FFF1F2] border-2 border-[#1a1a1a] shadow-[3px_4px_0px_#1a1a1a] p-6 rounded-2xl relative space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">🥸</span>
                  <div>
                    <h4 className="doodle-role-title text-xl font-black text-[#BE123C]">
                      The Fake Artist
                    </h4>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9F1239] bg-[#FFE4E6] px-2 py-0.5 rounded-md border border-[#E11D48]">
                      Secret Imposter
                    </span>
                  </div>
                </div>

                <ul className="text-xs sm:text-sm text-[#881337] space-y-2.5 font-bold leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#BE123C] text-base">✓</span>
                    <span>Only sees the category (the secret word is hidden!).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#BE123C] text-base">✓</span>
                    <span>Watch previous strokes, pretend you know, and blend in.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EAB308] text-base">⭐</span>
                    <span>Win by avoiding the vote, OR by guessing the secret word at the end!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Word Categories Teaser */}
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-2">
              <DoodleStar className="w-6 h-6" color="#F5D800" />
              <h3 className="doodle-panel-heading text-2xl sm:text-3xl font-black text-[#1a1a1a]">
                Preset Word Categories
              </h3>
              <DoodleStar className="w-6 h-6" color="#F5D800" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((c) => (
                <div
                  key={c.name}
                  className="doodle-category-card p-3.5 bg-white rounded-xl border-2 border-[#1a1a1a] shadow-[2.5px_3.5px_0px_#1a1a1a] text-center space-y-1.5 hover:-translate-y-1 transition-all cursor-default"
                >
                  <div className="text-3xl filter drop-shadow-sm">{c.emoji}</div>
                  <div className="doodle-cat-name text-xs font-black text-[#1a1a1a]">
                    {c.name}
                  </div>
                  <div className="text-[10px] font-bold text-[#6B7280] truncate">
                    {c.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Scoped Styles ── */}
      <style>{`
        @font-face {
          font-family: 'CfCrayons';
          src: url('/fonts/CfCrayonsRegular-2Gl3.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .doodle-section-title {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          font-size: clamp(2rem, 4.5vw, 3.8rem);
          font-weight: 900;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(2px 3px 0px rgba(0,0,0,0.12));
          line-height: 1.1;
        }

        .doodle-section-title > span {
          display: inline-block;
          -webkit-text-stroke: 2px #1a1a1a;
          paint-order: stroke fill;
        }

        .doodle-panel-heading {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          letter-spacing: 0.03em;
          -webkit-text-stroke: 1.5px #1a1a1a;
          paint-order: stroke fill;
        }

        .doodle-card-title {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          letter-spacing: 0.02em;
        }

        .doodle-role-title {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          letter-spacing: 0.03em;
        }

        .doodle-cat-name {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          letter-spacing: 0.02em;
        }

        .doodle-badge {
          background: #ffffff;
          border: 2px solid #1a1a1a;
          box-shadow: 2px 2.5px 0px #1a1a1a;
        }

        .doodle-badge-text {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          color: #1a1a1a;
          letter-spacing: 0.06em;
        }

        .doodle-card {
          background: #ffffff;
          border-radius: 16px;
          border: 2.5px solid #1a1a1a;
          box-shadow: 0 0 0 2px #ffffff, 3.5px 5px 0px 2px #1a1a1a;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .doodle-card:hover {
          transform: translateY(-4px) scale(1.01) !important;
          box-shadow: 0 0 0 2px #ffffff, 5px 7px 0px 2px #1a1a1a;
        }

        .doodle-step-pill {
          font-family: 'CfCrayons', 'Comic Sans MS', cursive;
          font-size: 0.8rem;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 9999px;
          border: 2px solid #1a1a1a;
          box-shadow: 1.5px 2px 0px #1a1a1a;
        }

        .doodle-tape {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 18px;
          background: rgba(254, 240, 138, 0.75);
          border: 1px dashed rgba(0, 0, 0, 0.25);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        .doodle-paper-container {
          background: #ffffff;
          border-radius: 20px;
          border: 2.5px solid #1a1a1a;
          box-shadow: 0 0 0 3px #ffffff, 4px 6px 0px 3px #1a1a1a;
        }

        .doodle-pin {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 18px;
          background: #EF4444;
          border: 2px solid #1a1a1a;
          border-radius: 50%;
          box-shadow: 2px 2px 0px #1a1a1a;
        }
      `}</style>
    </div>
  );
}
