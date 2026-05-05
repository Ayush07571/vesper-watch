'use client';

import React, { useState, useEffect } from 'react';

interface LoaderProps {
  progress: number;
  isVisible: boolean;
}

const facts = [
  "Precision-engineered from Grade 5 Titanium.",
  "244 unique components in perfect synchronization.",
  "Hand-finished bridge work for unparalleled depth.",
  "Born skeletal. Perfection through elimination.",
  "Designed for the eternal pursuit of accuracy.",
  "The Equinox Caliber: A masterclass in minimalism."
];

export default function Loader({ progress, isVisible }: LoaderProps) {
  const [currentFact, setCurrentFact] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentFact((prev) => (prev + 1) % facts.length);
        setFade(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-[#080705] flex flex-col justify-center items-center z-[9999] transition-opacity duration-1000 ease-out"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="loader-brand font-serif text-3xl mb-12 tracking-[0.6em] opacity-90 uppercase text-[#f0ece4]">
        VESPER
      </div>
      
      <div className="progress-container w-[280px] h-px bg-white/10 relative overflow-hidden mb-10">
        <div 
          className="progress-bar absolute top-0 left-0 h-full bg-[#c8622a] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div 
        className="fact-container h-8 transition-all duration-500 ease-in-out px-8"
        style={{ 
          opacity: fade ? 0.6 : 0,
          transform: `translateY(${fade ? 0 : 5}px)`
        }}
      >
        <p className="text-[#8a8070] font-light text-xs tracking-[0.2em] uppercase text-center max-w-[400px] leading-relaxed">
          {facts[currentFact]}
        </p>
      </div>

      <div className="absolute bottom-12 text-[0.6rem] tracking-[0.4em] text-white/20 uppercase">
        Initializing Caliber {Math.round(progress)}%
      </div>
    </div>
  );
}
