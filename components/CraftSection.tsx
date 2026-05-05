'use client';

import React from 'react';
import Image from 'next/image';
import FadeInSection from './FadeInSection';

export default function CraftSection() {
  return (
    <FadeInSection id="craft" className="py-40 px-[8%] flex flex-col md:flex-row-reverse items-center gap-20">
      <div className="flex-1 text-left">
        <span className="label-text mb-6 inline-block">The Mastery</span>
        <h2 className="text-4xl md:text-5xl mb-8 max-w-[800px] leading-tight uppercase font-serif tracking-[0.3em]">
          Mastery in Every Single Component.
        </h2>
        <p className="max-w-[600px] text-[#8a8070] text-lg font-light leading-relaxed">
          The Equinox is a testament to the dying art of hand-finishing. In our Glashütte workshop, master watchmakers spend hundreds of hours beveling, polishing, and graining each of the 244 mechanical parts. It is this unseen dedication that gives the watch its soul.
        </p>
      </div>
      <div className="flex-1 relative aspect-video w-full overflow-hidden border border-white/5 rounded-sm group">
        <Image 
          src="/images/heritage_detail.png" 
          alt="Hand-finishing the Caliber V.01" 
          fill
          className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080705] to-transparent opacity-40" />
      </div>
    </FadeInSection>
  );
}
