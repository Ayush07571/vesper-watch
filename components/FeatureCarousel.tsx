'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const features = [
  {
    title: "The Caliber V.01",
    subtitle: "Mechanical Purity",
    description: "A skeletonized masterpiece where every bridge and gear is visible. Finished by hand with anglage and perlage techniques usually reserved for high horology.",
    image: "/images/caliber-detail.webp"
  },
  {
    title: "Grade 5 Titanium",
    subtitle: "Aerospace Precision",
    description: "The Equinox case is forged from Grade 5 Titanium—a material stronger than steel but 40% lighter, ensuring comfort without compromising on durability.",
    image: "/images/titanium-detail.webp"
  },
  {
    title: "244 Components",
    subtitle: "Complex Harmony",
    description: "Hundreds of individual parts working in perfect synchronization. A vertical clutch and column wheel mechanism ensure a tactile, high-precision experience.",
    image: "/images/components-detail.webp"
  }
];

export default function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 bg-[#080705] overflow-hidden" id="excellence">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
          
          {/* Text Content */}
          <div className="w-full lg:w-5/12 space-y-12">
            <div className="space-y-2">
              <span className="text-[#c8622a] uppercase tracking-[0.4em] text-xs font-semibold">Technical Excellence</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-wider leading-tight">
                PRECISION<br />BY DESIGN.
              </h2>
            </div>

            <div className="relative mt-12 space-y-12">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className={`transition-all duration-700 cursor-pointer group ${activeIndex === idx ? 'opacity-100 translate-x-4' : 'opacity-30 hover:opacity-50'}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <div className="flex items-start gap-6">
                    <span className={`text-xl font-serif mt-1 transition-colors ${activeIndex === idx ? 'text-[#c8622a]' : 'text-white/50'}`}>
                      0{idx + 1}
                    </span>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-serif text-white group-hover:text-[#c8622a] transition-colors">
                        {feature.title}
                      </h3>
                      {activeIndex === idx && (
                        <p className="text-[#8a8070] text-lg leading-relaxed max-w-md animate-in fade-in slide-in-from-left-4 duration-700">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Display - More compact and elegant */}
          <div className="w-full lg:w-5/12 relative aspect-[4/5] group max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#c8622a]/5 to-transparent rounded-2xl z-0" />
            
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-out transform ${
                  activeIndex === idx 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
                }`}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                  <Image 
                    src={feature.image} 
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-8 left-8 right-8 space-y-1">
                    <p className="text-[#c8622a] uppercase tracking-widest text-[10px] font-bold">{feature.subtitle}</p>
                    <p className="text-white font-serif text-xl">{feature.title}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Dots */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-12 h-1 transition-all duration-500 ${activeIndex === idx ? 'bg-[#c8622a]' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
