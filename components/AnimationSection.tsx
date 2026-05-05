'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Loader from './Loader';

const frameCount = 244;
const currentFrame = (index: number) => `/images/ezgif-frame-${index.toString().padStart(3, '0')}.png`;

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
  const imagesRef = useRef<ImageBitmap[]>([]);
  const lastFrameRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number>();
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Preload Images
  useEffect(() => {
    let isMounted = true;
    const preload = async () => {
      let done = 0;
      const bitmaps: ImageBitmap[] = [];
      
      for (let i = 1; i <= frameCount; i++) {
        if (!isMounted) return;
        try {
          const res = await fetch(currentFrame(i));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const bm = await createImageBitmap(blob, { resizeQuality: 'high' });
          bitmaps.push(bm);
          done++;
          if (i % 10 === 0 || i === frameCount) {
            setProgress((done / frameCount) * 100);
          }
        } catch (err) {
          console.error(`Failed to load frame ${i}:`, err);
        }
      }

      if (isMounted) {
        imagesRef.current = bitmaps;
        setLoading(false);
      }
    };

    preload();
    return () => { isMounted = false; };
  }, []);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || imagesRef.current.length === 0) return;

    const frameIndex = Math.max(1, Math.min(imagesRef.current.length, imagesRef.current.length - Math.floor(index)));
    const bitmap = imagesRef.current[frameIndex - 1];
    
    if (!bitmap) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasLogicalWidth = canvas.width / dpr;
    const canvasLogicalHeight = canvas.height / dpr;

    // Background Removal
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
    const threshold = 42; // Slightly higher to be safe

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luminance < threshold) {
        data[i + 3] = 0;
      } else if (luminance < threshold + 15) {
        data[i + 3] = Math.round(((luminance - threshold) / 15) * 255);
      }
    }

    offCtx.putImageData(imageData, 0, 0);

    ctx.clearRect(0, 0, canvasLogicalWidth, canvasLogicalHeight);
    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height, 0, 0, canvasLogicalWidth, canvasLogicalHeight);
    
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height, 0, 0, canvasLogicalWidth, canvasLogicalHeight);
    
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  };

  const updateContent = (progress: number) => {
    const fadeWindow = 0.05;

    contentBlocks.forEach(block => {
      const el = document.getElementById(block.id);
      if (!el) return;

      let opacity = 0;
      let translateY = 20; 

      if (progress >= block.start && progress <= block.end) {
        if (progress < block.start + fadeWindow) {
          opacity = (progress - block.start) / fadeWindow;
        } else if (progress > block.end - fadeWindow) {
          opacity = (block.end - progress) / fadeWindow;
        } else {
          opacity = 1;
        }
        translateY = (1 - opacity) * 20;
      }

      el.style.opacity = opacity.toString();
      el.style.transform = `translateY(${translateY}px)`;
      el.style.visibility = opacity === 0 ? 'hidden' : 'visible';

      // Synchronize -left and -right sub-elements if they exist
      const leftPart = document.getElementById(`${block.id}-left`);
      const rightPart = document.getElementById(`${block.id}-right`);
      if (leftPart) {
        leftPart.style.opacity = opacity.toString();
        leftPart.style.transform = `translateY(${translateY}px)`;
        leftPart.style.visibility = opacity === 0 ? 'hidden' : 'visible';
      }
      if (rightPart) {
        rightPart.style.opacity = opacity.toString();
        rightPart.style.transform = `translateY(${translateY}px)`;
        rightPart.style.visibility = opacity === 0 ? 'hidden' : 'visible';
      }
    });

    const listItems = document.querySelectorAll('.component-list li');
    if (listItems.length > 0 && progress >= 0.45 && progress <= 0.65) {
      const blockProgress = (progress - 0.45) / (0.65 - 0.45); 
      listItems.forEach((item, i) => {
        const itemEl = item as HTMLElement;
        const itemThreshold = i / listItems.length;
        const itemOpacity = Math.max(0, Math.min(1, (blockProgress - itemThreshold) / 0.15));
        itemEl.style.opacity = itemOpacity.toString();
      });
    }

    const indicator = document.getElementById('scroll-indicator');
    if (indicator) indicator.style.opacity = progress > 0.03 ? '0' : '1';
  };

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    const section = containerRef.current;
    if (section) {
      const scrollFraction = window.scrollY / (section.offsetHeight - window.innerHeight);
      renderFrame(scrollFraction * (imagesRef.current.length - 1));
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

      const frameIndex = clampedProgress * (imagesRef.current.length - 1);
      if (Math.floor(frameIndex) !== lastFrameRef.current) {
        renderFrame(frameIndex);
        lastFrameRef.current = Math.floor(frameIndex);
      }
      
      updateContent(clampedProgress);

      animationFrameIdRef.current = requestAnimationFrame(update);
    };

    animationFrameIdRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [loading]);

  return (
    <>
      <Loader progress={progress} isVisible={loading} />
      
      <section ref={containerRef} id="animation-section" className="h-[500vh] relative bg-[#080705]">
        <div className="sticky top-0 h-screen w-full grid grid-cols-[1fr_2fr_1fr] px-[6vw] items-center">
          
          {/* Left Gutter */}
          <div className="relative h-full flex flex-col justify-center pointer-events-none z-20">
            {/* Main Block 1 Content */}
            <div id="block-1" className="content-panel opacity-0">
               <span className="label-text mb-4 block">The First Edition</span>
               <h1 className="title-serif">THE<br/>EQUINOX</h1>
               <p className="caption-text">BY VESPER</p>
            </div>

            <div id="block-2" className="content-panel opacity-0">
               <span className="label-text mb-4 block text-accent">Philosophy</span>
               <h2 className="subtitle-serif">Mechanical<br/>Purity.</h2>
               <p className="paragraph-text mt-4">Architecture of time revealed in its purest form. Each component hand-finished.</p>
            </div>

            <div id="block-3" className="content-panel opacity-0">
               <ul className="component-list">
                 <li><span className="item-title">Sapphire</span><span className="item-sub">Double-domed crystal</span></li>
                 <li><span className="item-title">Sunburst</span><span className="item-sub">Charcoal finish dial</span></li>
                 <li><span className="item-title">Titanium</span><span className="item-sub">Grade 5 polished case</span></li>
               </ul>
            </div>
          </div>

          {/* Center Gutter - Watch */}
          <div className="relative h-full w-full flex items-center justify-center z-10 overflow-hidden">
            <canvas 
              ref={canvasRef} 
              className="max-h-[90vh] w-auto pointer-events-none"
              style={{ 
                background: 'transparent',
                imageRendering: '-webkit-optimize-contrast'
              }}
            />
          </div>

          {/* Right Gutter */}
          <div className="relative h-full flex flex-col justify-center text-right pointer-events-none z-20">
            {/* Balanced Block 1 Right Panel */}
            <div id="block-1-right" className="content-panel opacity-0">
               <h1 className="title-serif">244</h1>
               <p className="caption-text">LIMITED EDITION PIECES</p>
            </div>

            {/* Mirroring blocks for the right side or unique content */}
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
                  <Link href="/contact" className="btn pointer-events-auto">
                    Secure Timepiece
                  </Link>
               </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div id="scroll-indicator" className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-opacity duration-500 z-[100]">
            <span className="label-text">Explore</span>
            <div className="w-[1px] h-[60px] bg-gradient-to-b from-[#c8622a] to-transparent" />
          </div>
        </div>

        <style jsx>{`
          .content-panel {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
          }

          .title-serif {
            font-family: var(--font-serif);
            font-size: clamp(2rem, 4vw, 4.5rem);
            letter-spacing: 0.25em;
            line-height: 1.1;
            margin-bottom: 1rem;
            white-space: nowrap;
          }

          .subtitle-serif {
            font-family: var(--font-serif);
            font-size: clamp(1.2rem, 2vw, 2.5rem);
            letter-spacing: 0.15em;
            line-height: 1.2;
            text-transform: uppercase;
          }

          .caption-text {
            font-size: 0.7rem;
            letter-spacing: 0.35em;
            color: var(--accent-color);
            font-weight: 300;
          }

          .paragraph-text {
            font-size: 0.85rem;
            color: var(--text-muted);
            line-height: 1.8;
          }

          .component-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .item-title {
            font-family: var(--font-serif);
            font-size: 0.75rem;
            letter-spacing: 0.2em;
            color: var(--accent-color);
            text-transform: uppercase;
            display: block;
            margin-bottom: 0.2rem;
          }

          .item-sub {
            font-size: 0.65rem;
            letter-spacing: 0.1em;
            color: var(--text-muted);
          }

          .spec-rows {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .spec-item {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 1rem;
          }

          .spec-label {
            font-size: 0.6rem;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: var(--accent-color);
          }

          .spec-value {
            font-size: 0.85rem;
            font-weight: 300;
          }

          @media (max-width: 1024px) {
            .title-serif { font-size: 2.5rem; }
          }

          @media (max-width: 768px) {
            section { height: auto !important; }
            .sticky { position: relative !important; height: auto !important; }
            .grid { display: block; padding: 4rem 1.5rem; }
            .content-panel { position: relative; top: 0; transform: none; margin-bottom: 4rem; opacity: 1 !important; visibility: visible !important; }
            canvas { height: 50vh !important; margin: 2rem 0; }
          }
        `}</style>
      </section>
    </>
  );
}
