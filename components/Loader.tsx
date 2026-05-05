'use client';

import React from 'react';

interface LoaderProps {
  progress: number;
  isVisible: boolean;
}

export default function Loader({ progress, isVisible }: LoaderProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-[#080705] flex flex-col justify-center items-center z-9999 transition-opacity duration-1000 ease-out"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="loader-brand font-serif text-2xl mb-8 tracking-[0.5em] opacity-80 uppercase text-[#f0ece4]">
        VESPER
      </div>
      <div className="progress-container w-[200px] h-px bg-white/10 relative overflow-hidden">
        <div 
          className="progress-bar absolute top-0 left-0 h-full bg-[#c8622a] transition-all duration-100 linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
