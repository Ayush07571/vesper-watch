'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FadeInSection from './FadeInSection';

export default function FinalCTA() {
  return (
    <FadeInSection className="py-60 px-[10%] flex flex-col items-center text-center relative overflow-hidden min-h-[80vh] justify-center">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/final_hero.png" 
          alt="The Vesper Equinox on pedestal" 
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-transparent to-[#080705]" />
      </div>

      <div className="relative z-10">
        <span className="label-text mb-6 inline-block">Join the Waitlist</span>
        <h2 className="text-3xl md:text-6xl mb-8 uppercase font-serif tracking-[0.2em] md:tracking-[0.4em] text-indent-[0.2em] md:text-indent-[0.4em] leading-tight">
          Limited to 244 Pieces<br/>Worldwide.
        </h2>
        <p className="mb-12 text-[#8a8070] font-light text-lg tracking-[0.1em]">
          The first edition is now open for reservations.
        </p>
        <Link href="/contact" className="btn px-12 py-5 text-lg">
          Reserve Your Timepiece
        </Link>
      </div>
    </FadeInSection>
  );
}
