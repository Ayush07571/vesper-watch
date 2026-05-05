'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full px-8 md:px-16 py-8 flex justify-between items-center z-1000 mix-blend-mode-difference">
      <Link href="/" className="logo text-xl md:text-2xl font-serif tracking-[0.4em] text-white hover:opacity-70 transition-opacity cursor-pointer">
        VESPER
      </Link>
      
      <div className="nav-links hidden md:flex gap-12">
        {['Heritage', 'Specifications', 'Craft'].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-[0.7rem] text-white uppercase tracking-[0.3em] opacity-70 hover:opacity-100 transition-all duration-500"
          >
            {link}
          </a>
        ))}
      </div>

      <div className="nav-cta">
        <Link 
          href="/contact" 
          className="btn px-6 py-3 md:px-8 md:py-4 text-[0.6rem] md:text-[0.7rem]"
        >
          Acquire
        </Link>
      </div>

      <style jsx>{`
        .mix-blend-mode-difference {
          mix-blend-mode: difference;
        }
      `}</style>
    </nav>
  );
}
