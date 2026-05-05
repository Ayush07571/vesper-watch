'use client';

import React from 'react';
import FadeInSection from './FadeInSection';

export default function HeritageSection() {
  return (
    <FadeInSection id="heritage" className="py-40 px-[10%] flex flex-col items-center text-center">
      <span className="label-text mb-4">Our Heritage</span>
      <h2 className="text-4xl md:text-5xl mb-12 max-w-[800px] leading-tight uppercase font-serif tracking-[0.3em]">
        A Legacy Reimagined for the Modern Horologist.
      </h2>
      <p className="max-w-[750px] text-[#8a8070] text-lg md:text-xl font-light leading-relaxed">
        Vesper was founded on a singular premise: that time should not just be measured, but observed in its most skeletal and beautiful form. Drawing inspiration from centuries of German watchmaking, we continue the tradition of Glashütte with a radical, transparent vision.
      </p>
      
      <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-2 gap-12 text-left border-t border-white/5 pt-20">
         <div className="space-y-4">
            <h4 className="text-sm tracking-[0.2em] text-[#c8622a] uppercase">Origin</h4>
            <p className="text-sm text-[#8a8070] font-light">Established in the heart of Saxony, where every vibration counts.</p>
         </div>
         <div className="space-y-4">
            <h4 className="text-sm tracking-[0.2em] text-[#c8622a] uppercase">Vision</h4>
            <p className="text-sm text-[#8a8070] font-light">Transparency as the ultimate luxury. No secrets, just mechanics.</p>
         </div>
      </div>
    </FadeInSection>
  );
}
