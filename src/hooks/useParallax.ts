import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Moves the element vertically at `speed` × the scroll offset of its container. */
export function useParallax<T extends HTMLElement>(speed = 0.25) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const container = el?.parentElement;
    if (!el || !container || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = container.getBoundingClientRect().top;
      el.style.transform = `translate3d(0, ${(-top * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      el.style.transform = '';
    };
  }, [reduced, speed]);

  return ref;
}
