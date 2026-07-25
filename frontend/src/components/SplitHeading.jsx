import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * SplitHeading — Animate heading text word-by-word with GSAP stagger reveal.
 * Works with Lenis (uses IntersectionObserver, not ScrollTrigger).
 *
 * Props:
 *  - as: HTML tag ('h1'|'h2'|'h3') — default 'h2'
 *  - text: string
 *  - className, style: forwarded to wrapper element
 */
export default function SplitHeading({ as: Tag = 'h2', text, className = '', style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;

    // Split by word — preserves Vietnamese diacritics perfectly
    const words = text.split(' ');
    el.innerHTML = words
      .map(w => `<span class="split-word-wrap"><span class="split-word">${w}</span></span>`)
      .join(' ');

    const wordEls = el.querySelectorAll('.split-word');

    // Start hidden
    gsap.set(wordEls, { y: '110%', opacity: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        gsap.to(wordEls, {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.06,
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return <Tag ref={ref} className={className} style={style} />;
}
