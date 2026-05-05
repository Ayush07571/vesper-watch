'use client';

/// <reference types="react" />
import React, { useEffect, useRef, useState } from 'react';

interface FadeInSectionProps {
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export default function FadeInSection({ children, className = '', id }: FadeInSectionProps) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      });
    }, { threshold: 0.1 });

    const current = domRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      id={id}
      className={`${className} fade-in-section ${isVisible ? 'visible' : ''}`}
    >
      {children}
    </div>
  );
}
