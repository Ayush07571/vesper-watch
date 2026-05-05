'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Loader from './Loader';

const frameCount = 244;
const PRIORITY_LIMIT = 120; 
const currentFrame = (index: number) => `/images/ezgif-frame-${index.toString().padStart(3, '0')}.webp`;

const contentBlocks = [
  { id: 'block-1', start: 0,    end: 0.15 },
  { id: 'block-2', start: 0.18, end: 0.38 },
  { id: 'block-3', start: 0.42, end: 0.62 },
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
    const fetchImage = async (i: number) => {
      try {
        const res = await fetch(currentFrame(i));
        const blob = await res.blob();
        return await createImageBitmap(blob);
      } catch { return null; }
    };

    const preload = async () => {
      // 1. Priority Load (First 120 frames)
      for (let i = 1; i <= PRIORITY_LIMIT; i++) {
        if (!isMounted) return;
        const bm = await fetchImage(i);
        if (bm) imagesRef.current[i - 1] = bm;
        setProgress((i / PRIORITY_LIMIT) * 100);
      }
      
      if (isMounted) {
        setLoading(false);
        renderFrame(0);
      }

      // 2. Batch Background Load (Remaining frames in parallel groups of 10)
      const batchSize = 10;
      for (let i = PRIORITY_LIMIT + 1; i <= frameCount; i += batchSize) {
        if (!isMounted) return;
        const batch = [];
        for (let j = 0; j < batchSize && (i + j) <= frameCount; j++) {
          batch.push(fetchImage(i + j));
        }
        const results = await Promise.all(batch);
        results.forEach((bm, idx) => {
          if (bm) imagesRef.current[i + idx - 1] = bm;
        });
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
    if (!bitmap) {
      for (let o = 1; o < 30; o++) {
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

    // CENTERED CONTAIN with 70% scale factor to prevent overlap
    const SCALE = 0.7; 
    
    if (canvasRatio > imgRatio) {
      drawHeight = canvasLogicalHeight * SCALE;
      drawWidth = drawHeight * imgRatio;
    } else {
      drawWidth = canvasLogicalWidth * SCALE;
      drawHeight = drawWidth / imgRatio;
    }
    
    offsetX = (canvasLogicalWidth - drawWidth) / 2;
    offsetY = (canvasLogicalHeight - drawHeight) / 2;

    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = 'high';
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offCtx.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);

    // REMOVE WATERMARK: Mask out the bottom-right corner area where "VEO" appears
    offCtx.clearRect(offsetX + drawWidth * 0.8, offsetY + drawHeight * 0.85, drawWidth * 0.2, drawHeight * 0.15);

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
    if (!canvas || !sticky) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = sticky.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const section = containerRef.current;
    if (section) {
       const scrollFraction = window.scrollY / (section.offsetHeight - window.innerHeight);
       renderFrame(Math.max(0, Math.min(1, scrollFraction)) * (frameCount - 1));
    }
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
            let opacity = Math.sin(bp * Math.PI);
            if (block.id === 'block-5' && clampedProgress >= 0.95) opacity = 1;
            el.style.opacity = opacity.toString();
            el.style.visibility = 'visible';
            el.style.transform = `translateY(${(1-opacity)*25}px)`;
            if (rel) { rel.style.opacity = opacity.toString(); rel.style.visibility = 'visible'; rel.style.transform = `translateY(${(1-opacity)*25}px)`; }
          } else {
            if (block.id === 'block-5' && clampedProgress > 0.99) {
               el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = `translateY(0px)`;
               if (rel) { rel.style.opacity = '1'; rel.style.visibility = 'visible'; rel.style.transform = `translateY(0px)`; }
            } else {
               el.style.opacity = '0'; el.style.visibility = 'hidden'; el.style.transform = `translateY(40px)`;
               if (rel) { rel.style.opacity = '0'; rel.style.visibility = 'hidden'; rel.style.transform = `translateY(40px)`; }
            }
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
    <section ref={containerRef} className="relative h-[600vh] bg-[#080705]">
      <Loader progress={progress} isVisible={loading} />
      
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* LAYER 1: Balanced Watch Layer */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <canvas ref={canvasRef} className="watch-canvas" />
        </div>

        {/* LAYER 2: Text Panels (Wider gutters to prevent overlap) */}
        <div className="absolute inset-0 z-20 flex justify-between px-[6vw] pointer-events-none">
          
          <div className="relative h-full w-[400px] flex flex-col justify-center text-left">
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

          <div className="relative h-full w-[400px] flex flex-col justify-center text-right">
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
        .watch-canvas { width: 100%; height: 100%; object-fit: contain; background: transparent; }
        .content-panel { position: absolute; width: 100%; transition: all 1s ease; }
        .title-serif { font-size: 5rem; line-height: 0.9; margin-bottom: 1rem; color: white; white-space: nowrap; }
        .subtitle-serif { font-size: 3.5rem; line-height: 1; margin-bottom: 1.5rem; color: white; white-space: nowrap; }
        .label-text { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.4em; color: #c8622a; }
        .caption-text { font-size: 0.7rem; letter-spacing: 0.5em; color: #c8622a; text-transform: uppercase; }
        .description-text { font-size: 1.1rem; color: #8a8070; line-height: 1.6; font-weight: 300; }
        .spec-rows { display: flex; flex-direction: column; gap: 1.5rem; }
        .spec-item { display: flex; flex-direction: column; gap: 0.2rem; }
        .spec-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.2em; color: #c8622a; }
        .spec-value { font-size: 1.2rem; color: white; font-family: var(--font-serif); text-transform: uppercase; letter-spacing: 0.1em; }
        @media (max-width: 1400px) { .title-serif { font-size: 3.5rem; } .subtitle-serif { font-size: 2.5rem; } }
      `}</style>
    </section>
  );
}
