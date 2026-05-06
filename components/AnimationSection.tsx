'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Loader from './Loader';

const frameCount = 244;
const PRIORITY_LIMIT = 120; 
const currentFrame = (index: number) => `/images/ezgif-frame-${Math.max(1, Math.min(frameCount, Math.floor(index))).toString().padStart(3, '0')}.webp`;

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
  const watchContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(ImageBitmap | null)[]>(new Array(frameCount).fill(null));
  const lastFrameRef = useRef<number>(-1);
  const rafIdRef = useRef<number>();
  const currentProgressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
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

  const getFrameIndex = (clampedProgress: number) => {
    if (clampedProgress < 0.1) {
      return 1; // Fully Assembled (Frame 1)
    } else if (clampedProgress < 0.25) {
      // Quick Explosion effect
      const p = (clampedProgress - 0.1) / 0.15;
      return 1 + p * (frameCount - 1);
    } else {
      // Slow, sophisticated re-assembly (The "Correct" movement)
      const p = (clampedProgress - 0.25) / 0.75;
      return frameCount - (p * (frameCount - 1));
    }
  };

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

    const isMobile = window.innerWidth < 768;
    const SCALE = isMobile ? 0.9 : 0.7; 
    
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

    // REMOVE WATERMARK
    offCtx.clearRect(offsetX + drawWidth * 0.8, offsetY + drawHeight * 0.85, drawWidth * 0.2, drawHeight * 0.15);

    const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const data32 = new Uint32Array(data.buffer);
    
    // High-speed 32-bit pixel processing
    for (let i = 0; i < data32.length; i++) {
      const pixel = data32[i];
      // Extract RGB from 32-bit (Assuming little-endian ABGR)
      const r = pixel & 0xFF;
      const g = (pixel >> 8) & 0xFF;
      const b = (pixel >> 16) & 0xFF;
      const avg = (r + g + b) / 3;
      if (avg < 42) {
        data32[i] = 0; // Set entire pixel to transparent black
      }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  };

  const resize = () => {
    const canvas = canvasRef.current;
    const watchContainer = watchContainerRef.current;
    if (!canvas || !watchContainer) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = watchContainer.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const section = containerRef.current;
    if (section) {
       const scrollFraction = window.scrollY / (section.offsetHeight - window.innerHeight);
       const clamped = Math.max(0, Math.min(1, scrollFraction));
       renderFrame(getFrameIndex(clamped));
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
      const target = Math.max(0, Math.min(1, scrollFraction));
      targetProgressRef.current = target;

      // Silky Smooth Lerp (Linear Interpolation)
      const lerpFactor = 0.08; 
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * lerpFactor;
      
      // Snap to target if very close
      if (Math.abs(targetProgressRef.current - currentProgressRef.current) < 0.0001) {
        currentProgressRef.current = targetProgressRef.current;
      }

      const clampedProgress = currentProgressRef.current;
      
      // Direct DOM manipulation for progress bar (Bypasses React lag)
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${clampedProgress * 100}%`;
      }

      const frameIndex = getFrameIndex(clampedProgress);
      if (Math.floor(frameIndex) !== lastFrameRef.current) {
        renderFrame(frameIndex);
        lastFrameRef.current = Math.floor(frameIndex);
      }
      contentBlocks.forEach(block => {
        const el = document.getElementById(block.id);
        const rel = document.getElementById(`${block.id}-right`);
        const isMobile = window.innerWidth < 768;

        if (el) {
          if (clampedProgress >= block.start && clampedProgress <= block.end) {
            const bp = (clampedProgress - block.start) / (block.end - block.start);
            let opacity = Math.sin(bp * Math.PI);
            if (block.id === 'block-5' && clampedProgress >= 0.95) opacity = 1;
            el.style.opacity = opacity.toString();
            el.style.visibility = 'visible';
            el.style.transform = `translateY(${(1-opacity)*25}px)`;
            
            if (rel && !isMobile) { 
              rel.style.opacity = opacity.toString(); 
              rel.style.visibility = 'visible'; 
              rel.style.transform = `translateY(${(1-opacity)*25}px)`; 
            } else if (rel) {
              rel.style.opacity = '0';
              rel.style.visibility = 'hidden';
            }
          } else {
            if (block.id === 'block-5' && clampedProgress > 0.99) {
               el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = `translateY(0px)`;
               if (rel && !isMobile) { rel.style.opacity = '1'; rel.style.visibility = 'visible'; rel.style.transform = `translateY(0px)`; }
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
      
      <div ref={stickyRef} className="sticky top-0 h-screen w-full flex flex-col md:block overflow-hidden">
        
        {/* Watch Container */}
        <div ref={watchContainerRef} className="watch-chamber">
          <canvas ref={canvasRef} className="watch-canvas" />
        </div>

        {/* Narrative Container */}
        <div className="panels-container">
          
          <div className="side-column left-align">
            <div id="block-1" className="content-panel opacity-0">
               <div className="mobile-only mb-2">
                  <span className="text-[#c8622a] font-serif text-2xl tracking-[0.3em]">244</span>
                  <p className="text-[0.5rem] tracking-[0.2em] uppercase opacity-50">Pieces</p>
               </div>
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
            {/* MOBILE ONLY BLOCK IN LEFT COLUMN */}
            <div id="block-4-mobile" className="content-panel opacity-0 mobile-only">
               <span className="label-text mb-4 block">Technical</span>
               <div className="spec-rows">
                  <div className="spec-item"><span className="spec-label">Case</span><span className="spec-value">38mm Ti</span></div>
                  <div className="spec-item"><span className="spec-label">Power</span><span className="spec-value">42hr Reserve</span></div>
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

          <div className="side-column right-align desktop-only">
            <div id="block-1-right" className="content-panel opacity-0">
               <h1 className="title-serif text-white/30">244</h1>
               <p className="caption-text">LIMITED EDITION PIECES</p>
            </div>
            <div id="block-4-right" className="content-panel opacity-0">
               <span className="label-text mb-4 block">Technical</span>
               <div className="spec-rows">
                  <div className="spec-item"><span className="spec-label">Case</span><span className="spec-value">38mm Titanium</span></div>
                  <div className="spec-item"><span className="spec-label">Power</span><span className="spec-value">42hr Reserve</span></div>
                  <div className="spec-item"><span className="spec-label">Crystal</span><span className="spec-value">Sapphire AR</span></div>
               </div>
            </div>
          </div>

        </div>
        
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 z-[1000]">
          <div ref={progressBarRef} className="h-full bg-[#c8622a]" style={{ width: '0%' }} />
        </div>
      </div>

      <style jsx>{`
        /* MOBILE BASE STYLES */
        .watch-chamber {
          position: relative;
          height: 40vh;
          margin-top: 10vh;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .watch-canvas { width: 100%; height: 100%; object-fit: contain; background: transparent; }
        .panels-container {
          position: relative;
          height: 50vh;
          z-index: 20;
          display: flex;
          flex-direction: column;
          padding: 0 6vw;
          pointer-events: none;
        }
        .side-column {
          position: relative;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: flex-start;
        }
        .content-panel { 
          position: absolute; 
          width: 100%; 
          left: 0;
          top: 1rem;
          transition: all 1s ease; 
        }
        
        .title-serif { font-size: 2.2rem; line-height: 0.9; margin-bottom: 0.5rem; color: white; white-space: normal; letter-spacing: 0.2em; text-indent: 0.2em; }
        .subtitle-serif { font-size: 1.8rem; line-height: 1; margin-bottom: 1rem; color: white; white-space: normal; letter-spacing: 0.1em; text-indent: 0.1em; }
        .label-text { font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.4em; color: #c8622a; }
        .caption-text { font-size: 0.6rem; letter-spacing: 0.4em; color: #c8622a; text-transform: uppercase; }
        .description-text { font-size: 0.95rem; color: #8a8070; line-height: 1.5; font-weight: 300; padding: 0 2vw; }
        .spec-rows { display: flex; flex-direction: column; gap: 1rem; align-items: center; }
        .spec-item { display: flex; flex-direction: column; gap: 0.2rem; }
        .spec-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.2em; color: #c8622a; }
        .spec-value { font-size: 1rem; color: white; font-family: var(--font-serif); text-transform: uppercase; letter-spacing: 0.1em; }
        
        .mobile-only { display: block; }
        .desktop-only { display: none !important; }

        /* DESKTOP MEDIA QUERY (STRICT OVERRIDES) */
        @media (min-width: 768px) {
          .desktop-only { display: block !important; }
          .mobile-only { display: none !important; }

          .watch-chamber {
            position: absolute !important;
            inset: 0 !important;
            height: 100% !important;
            margin-top: 0 !important;
          }
          
          .panels-container {
            position: absolute !important;
            inset: 0 !important;
            height: 100% !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            padding: 0 6vw !important;
          }
          
          .side-column {
            position: relative !important;
            width: 400px !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: flex-start !important;
            text-align: left !important;
          }
          
          .left-align { align-items: flex-start !important; text-align: left !important; }
          .right-align { align-items: flex-end !important; text-align: right !important; }
          
          .content-panel { 
            position: absolute !important; 
            width: 100% !important; 
            top: auto !important; 
            left: auto !important;
          }
          
          .title-serif { font-size: 5rem !important; white-space: nowrap !important; letter-spacing: 0.5em !important; text-indent: 0 !important; margin-bottom: 1rem !important; }
          .subtitle-serif { font-size: 3.5rem !important; white-space: nowrap !important; letter-spacing: 0.3em !important; text-indent: 0 !important; margin-bottom: 1.5rem !important; }
          .label-text { font-size: 0.65rem !important; }
          .caption-text { font-size: 0.7rem !important; letter-spacing: 0.5em !important; }
          .description-text { font-size: 1.1rem !important; line-height: 1.6 !important; padding: 0 !important; }
          .spec-rows { gap: 1.5rem !important; align-items: flex-end !important; }
          .spec-value { font-size: 1.2rem !important; }
        }

        @media (max-width: 380px) {
          .panels-container { padding: 0 4vw; }
          .title-serif { font-size: 1.8rem; letter-spacing: 0.1em; text-indent: 0.1em; }
          .subtitle-serif { font-size: 1.4rem; letter-spacing: 0.05em; text-indent: 0.05em; }
          .description-text { font-size: 0.8rem; }
        }
      `}</style>
    </section>
  );
}
