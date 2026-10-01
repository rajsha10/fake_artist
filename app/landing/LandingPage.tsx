'use client';

import React from 'react';
import Hero from '@/components/landingPage/Hero';
import Info from '@/components/landingPage/Info';
import Footer from '@/components/landingPage/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col w-full selection:bg-yellow-200 selection:text-black">
      <Hero />
      <Info />
      <Footer />
    </main>
  );
}
