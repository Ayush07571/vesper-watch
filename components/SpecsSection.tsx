'use client';

import React from 'react';
import Image from 'next/image';
import FadeInSection from './FadeInSection';

export default function SpecsSection() {
  const specs = [
    {
      title: 'The Case',
      desc: '38mm round profile, crafted from Grade 5 titanium. Only 10mm thin with an integrated lug design that flows seamlessly into the wrist.'
    },
    {
      title: 'The Movement',
      desc: 'In-house Caliber V.01 skeletonized manual-wind movement. 42-hour power reserve, 28,800 vph, and 21 jewels.'
    },
    {
      title: 'The Details',
      desc: 'Slender orange seconds hand with a lume pip at its tip. Espresso leather strap with a custom titanium deployant clasp.'
    }
  ];

  return (
    <FadeInSection id="specifications" className="py-40 px-[8%] flex flex-col items-center text-center">
      <span className="label-text mb-4">Technical Excellence</span>
      <h2 className="text-4xl md:text-5xl mb-16 uppercase font-serif tracking-[0.3em]">
        Precision in Every Micron.
      </h2>

      <div className="w-full max-w-[1000px] mb-24 relative group h-[500px]">
        <div className="absolute inset-0 bg-[#c8622a]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <Image 
          src="/images/specs_view.png" 
          alt="Technical side profile of the Equinox case" 
          fill
          className="relative z-10 object-contain brightness-75 group-hover:brightness-100 transition-all duration-700"
        />
        <div className="absolute bottom-4 right-4 flex gap-4 z-20">
           <span className="text-[0.6rem] tracking-[0.4em] uppercase text-white/40">Profile / 10mm</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full mt-24">
        {specs.map((spec, index) => (
          <div key={index} className="text-left border-l border-[rgba(180,90,40,0.3)] pl-8">
            <h3 className="text-xl mb-4 font-serif uppercase tracking-[0.2em]">{spec.title}</h3>
            <p className="text-[0.9rem] text-[#8a8070] leading-relaxed font-light">{spec.desc}</p>
          </div>
        ))}
      </div>
    </FadeInSection>
  );
}
