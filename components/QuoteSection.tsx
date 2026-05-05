import React from 'react';
import FadeInSection from './FadeInSection';

export default function QuoteSection() {
  return (
    <FadeInSection className="py-40 px-[10%] flex flex-col items-center text-center">
      <blockquote className="font-serif text-3xl md:text-5xl leading-tight max-w-[900px] italic">
        &quot;The watch is not just a tool for time; it is a mechanical sculpture that breathes on the wrist.&quot;
      </blockquote>
      <cite className="block mt-12 text-[0.8rem] tracking-[0.5em] uppercase text-[#c8622a] not-italic">
        — Marcus Vesper, Founder
      </cite>
    </FadeInSection>
  );
}
