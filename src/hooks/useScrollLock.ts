import { useEffect } from 'react';

let locks = 0;

/** Stops the page behind an overlay from scrolling. Counted, so nested overlays work. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    locks++;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      locks--;
      if (locks === 0) document.documentElement.style.overflow = '';
    };
  }, [active]);
}
