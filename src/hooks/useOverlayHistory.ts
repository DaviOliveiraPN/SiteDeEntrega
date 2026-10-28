import { useEffect, useLayoutEffect, useRef } from 'react';

// Overlays (gallery sheet, lightbox) are not routes, but the phone's back gesture should close them.
// Opening pushes a history entry tagged with the overlay id (keeping React Router's own state);
// going back pops it and we close. Closing from the UI goes through history.back() so both paths match.

type OverlayState = { overlays?: string[] } & Record<string, unknown>;

function openOverlays(): string[] {
  return (history.state as OverlayState | null)?.overlays ?? [];
}

export function useOverlayHistory(id: string, open: boolean, onClose: () => void): () => void {
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    if (!openOverlays().includes(id)) {
      const state = (history.state as OverlayState | null) ?? {};
      history.pushState({ ...state, overlays: [...openOverlays(), id] }, '');
    }
    function onPopState() {
      if (!openOverlays().includes(id)) onCloseRef.current();
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [id, open]);

  return () => {
    if (openOverlays().includes(id)) history.back();
    else onCloseRef.current();
  };
}
