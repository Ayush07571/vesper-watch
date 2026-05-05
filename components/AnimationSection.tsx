'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Loader from './Loader';

const frameCount = 244;
const PRIORITY_COUNT = 40; // Load first 40 frames to show the site instantly
const BATCH_SIZE = 5; // Fetch in small parallel batches

const currentFrame = (index: number) => `/images/ezgif-frame-${index.toString().padStart(3, '0')}.webp`;

const contentBlocks = [
  { id: 'block-1', start: 0,    end: 0.18 },
  { id: 'block-2', start: 0.20, end: 0.40 },
  { id: 'block-3', start: 0.45, end: 0.65 },
  { id: 'block-4', start: 0.65, end: 0.85 },
  { id: 'block-5', start: 0.88, end: 1.00 },
];

export default function AnimationSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(ImageBitmap | null)[]>(new Array(frameCount).fill(null));
  const lastFrameRef = useRef<number>(-1);
  const rafIdRef = useRef<number>();
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchFrame = async (i: number) => {
      try {
        const res = await fetch(currentFrame(i));
        if (!res.ok) return null;
        const blob = await res.blob();
        return await createImageBitmap(blob, { resizeQuality: 'high' });
      } catch { return null; }
    };

    const preload = async () => {
      // Phase 1: PRIORITY LOAD
      // We load the first chunk sequentially to show the site ASAP
      for (let i = 1; i <= PRIORITY_COUNT; i++) {
        if (!isMounted) return;
        const bm = await fetchFrame(i);
        if (bm) imagesRef.current[i - 1] = bm;
        setProgress((i / PRIORITY_COUNT) * 100);
      }

      if (isMounted) {
        setLoading(false);
        renderFrame(0);
      }

      // Phase 2: BACKGROUND LOAD (In Batches)
      // We load the rest in small parallel batches to speed it up without freezing the UI
      for (let i = PRIORITY_COUNT + 1; i <= frameCount; i += BATCH_SIZE) {
        if (!isMounted) return;
        const batch = [];
        for (let j = 0; j < BATCH_SIZE && (i + j) <= frameCount; j++) {
          batch.push((async () => {
            const bm = await fetchFrame(i + j);
            if (bm) imagesRef.current[i + j - 1] = bm;
          })());
        }
        await Promise.all(batch);
      }
    };

    preload();
    return () => { isMounted = false; };
  }, []);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const frameIdx = Math.max(0, Math.min(frameCount - 1, Math.floor(index)));
    let bitmap = imagesRef.current[frameIdx];
    
    // Nearest neighbor fallback for background loading
    if (!bitmap) {
      for (let o = 1; o < 50; o++) {
        if (imagesRef.current[frameIdx - o]) { bitmap = imagesRef.current[frameIdx - o]; break; }
        if (imagesRef.current[frameIdx + o]) { bitmap = imagesRef.current[frameIdx + o]; break; }
      }
    }

    if (!bitmap) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasLogicalWidth = canvas.width / dpr;
    const canvasLogicalHeight = canvas.height / dpr;

    const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    const imgRatio = bitmap.width / bitmap.height;
    const canvasRatio = canvasLogicalWidth / canvasLogicalHeight;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawHeight = canvasLogicalHeight;
      drawWidth = canvasLogicalHeight * imgRatio;
      offsetX = (canvasLogicalWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvasLogicalWidth;
      drawHeight = canvasLogicalWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasLogicalHeight - drawHeight) / 2;
    }

    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = 'high';
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offCtx.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);

    const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (avg < 42) data[i + 3] = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  };

  const resize = () => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    const container = containerRef.current;
    if (!canvas || !sticky || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = sticky.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const scrollFraction = window.scrollY / (container.offsetHeight - window.innerHeight);
    renderFrame(Math.max(0, Math.min(1, scrollFraction)) * (frameCount - 1));
  };

  useEffect(() => {
    if (loading) return;

    window.addEventListener('resize', resize);
    resize();

    const update = () => {
      const section = containerRef.current;
      if (!section) return;

      const scrollFraction = window.scrollY / (section.offsetHeight - window.innerHeight);
      const clampedProgress = Math.max(0, Math.min(1, scrollFraction));
      setScrollProgress(clampedProgress);

      const frameIndex = clampedProgress * (frameCount - 1);
      if (Math.floor(frameIndex) !== lastFrameRef.current) {
        renderFrame(frameIndex);
        lastFrameRef.current = Math.floor(frameIndex);
      }
      
      contentBlocks.forEach(block => {
        const el = document.getElementById(block.id);
        const rel = document.getElementById(`${block.id}-right`);
        if (el) {
          if (clampedProgress >= block.start && clampedProgress <= block.end) {
            const bp = (clampedProgress - block.start) / (block.end - block.start);
            const opacity = Math.sin(bp * Math.PI);
            el.style.opacity = opacity.toString();
            el.style.visibility = 'visible';
            el.style.transform = `translateY(${(1-opacity)*25}px)`;
            if (rel) {
              rel.style.opacity = opacity.toString();
              rel.style.visibility = 'visible';
              rel.style.transform = `translateY(${(1-opacity)*25}px)`;
            }
          } else {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.transform = `translateY(40px)`;
            if (rel) { rel.style.opacity = '0'; rel.style.visibility = 'hidden'; rel.style.transform = `translateY(40px)`; }
          }
        }
      });

      rafIdRef.current = requestAnimationFrame(update);
    };

    rafIdRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [loading]);

  return (
    <section ref={containerRef} className="relative h-[550vh] bg-[#080705]">
      <Loader progress={progress} isVisible={loading} />
      
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="h-full w-full grid grid-cols-[1.2fr_2fr_1.2fr] px-[6vw]">
          
          <div className="relative h-full flex flex-col justify-center text-left pointer-events-none z-20">
            <div id="block-1" className="content-panel opacity-0">
               <span className="label-text mb-4 block">Collection 2026</span>
               <h1 className="title-serif">VESPER</h1>
               <p className="caption-text">THE EQUINOX EDITION</p>
            </div>
            <div id="block-2" className="content-panel opacity-0">
               <span className="label-text mb-4 block">The Caliber</span>
               <h2 className="subtitle-serif">BORN<br/>SKELETAL.</h2>
               <p className="description-text">Every bridge, every gear, every spring is stripped to its absolute essence. Perfection through elimination.</p>
            </div>
            <div id="block-3" className="content-panel opacity-0">
               <span className="label-text mb-4 block">Materials</span>
               <h2 className="subtitle-serif">GRADE 5<br/>TITANIUM.</h2>
               <p className="description-text">Lighter than steel. Stronger than time. A case crafted for the eternal pursuit of accuracy.</p>
            </div>
          </div>

          <div className="relative h-full flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-none" style={{ background: 'transparent' }} />
          </div>

          <div className="relative h-full flex flex-col justify-center text-right pointer-events-none z-20">
            <div id="block-1-right" className="content-panel opacity-0">
               <h1 className="title-serif text-white/30">244</h1>
               <p className="caption-text">LIMITED EDITION PIECES</p>
            </div>
            <div id="block-4" className="content-panel opacity-0">
               <span className="label-text mb-4 block">Technical</span>
               <div className="spec-rows">
                  <div className="spec-item"><span className="spec-label">Case</span><span className="spec-value">38mm Titanium</span></div>
                  <div className="spec-item"><span className="spec-label">Power</span><span className="spec-value">42hr Reserve</span></div>
                  <div className="spec-item"><span className="spec-label">Crystal</span><span className="spec-value">Sapphire AR</span></div>
               </div>
            </div>
            <div id="block-5" className="content-panel opacity-0">
               <span className="label-text mb-4 block">Availability</span>
               <h2 className="subtitle-serif">RESERVE<br/>EDITION.</h2>
               <div className="mt-8">
                  <Link href="/contact" className="btn pointer-events-auto">Secure Timepiece</Link>
               </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 z-[1000]">
          <div className="h-full bg-[#c8622a] transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
      </div>

      <style jsx>{`
        .content-panel { position: absolute; width: 100%; transition: all 1s ease; }
        .title-serif { font-size: 5rem; line-height: 0.9; margin-bottom: 1rem; color: white; }
        .subtitle-serif { font-size: 3.5rem; line-height: 1; margin-bottom: 1.5rem; color: white; }
        .label-text { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.4em; color: #c8622a; }
        .caption-text { font-size: 0.7rem; letter-spacing: 0.5em; color: #c8622a; text-transform: uppercase; }
        .description-text { font-size: 1rem; color: #8a8070; max-width: 350px; line-height: 1.6; font-weight: 300; }
        .spec-rows { display: flex; flex-direction: column; gap: 1.5rem; }
        .spec-item { display: flex; flex-direction: column; gap: 0.2rem; }
        .spec-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.2em; color: #c8622a; }
        .spec-value { font-size: 1.2rem; color: white; font-family: var(--font-serif); text-transform: uppercase; letter-spacing: 0.1em; }
        @media (max-width: 1200px) { .title-serif { font-size: 3.5rem; } .subtitle-serif { font-size: 2.5rem; } }
      `}</style>
    </section>
  );
}
