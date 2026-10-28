import { useEffect, useId, useRef, useState } from 'react';
import { downloadFile } from '../../lib/download';
import { fileName, formatBytes, mediaUrl, type DownloadVariant } from '../../lib/media';
import type { MediaItem } from '../../types';
import { DownloadIcon } from '../ui/icons';
import { Spinner } from '../ui/Spinner';

/** "Baixar" button with a small menu: "Versão web" / "Original". */
export function DownloadMenu({ item }: { item: MediaItem }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  async function download(variant: DownloadVariant) {
    setOpen(false);
    setBusy(true);
    try {
      await downloadFile(mediaUrl(item, variant), fileName(item, variant));
    } finally {
      setBusy(false);
    }
  }

  const option = 'flex min-h-11 w-full items-center justify-between gap-6 rounded-lg px-4 text-left text-sm hover:bg-cream/10 focus-visible:bg-cream/10';

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/20 bg-charcoal/40 px-5 text-sm text-cream backdrop-blur-sm hover:border-cream/45"
      >
        {busy ? <Spinner label="Baixando" /> : <DownloadIcon />} Baixar
      </button>
      {open && (
        <div id={menuId} role="menu" className="absolute right-0 bottom-full mb-2 w-60 rounded-card border border-line-dark bg-ink-soft p-1.5 shadow-xl shadow-black/50">
          <button type="button" role="menuitem" autoFocus className={option} onClick={() => download('web')}>
            Versão web <span className="text-xs text-cream/55">mais leve</span>
          </button>
          <button type="button" role="menuitem" className={option} onClick={() => download('original')}>
            Original <span className="text-xs text-cream/55">{formatBytes(item.sizeBytes)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
