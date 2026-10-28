import { useEffect, useRef, useState } from 'react';
import { downloadSequentially, saveBlob } from '../../lib/download';
import { fileName, formatBytes, mediaUrl, type DownloadVariant } from '../../lib/media';
import { buildZip } from '../../lib/zip';
import type { MediaItem } from '../../types';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';

type Step = { kind: 'choose' } | { kind: 'working'; done: number; total: number; mode: 'zip' | 'files' } | { kind: 'done' } | { kind: 'error'; variant: DownloadVariant };

/** Asks "web or original", then builds the ZIP with progress. Falls back to one-by-one downloads. */
export function DownloadAllDialog({ items, zipName, title, onClose }: { items: MediaItem[]; zipName: string; title: string; onClose: () => void }) {
  const [step, setStep] = useState<Step>({ kind: 'choose' });
  const abort = useRef<AbortController | null>(null);
  const originalSize = items.reduce((sum, m) => sum + m.sizeBytes, 0);

  useEffect(() => () => abort.current?.abort(), []);

  const entries = (variant: DownloadVariant) => items.map((m) => ({ url: mediaUrl(m, variant), name: fileName(m, variant) }));

  async function startZip(variant: DownloadVariant) {
    abort.current = new AbortController();
    const { signal } = abort.current;
    setStep({ kind: 'working', done: 0, total: items.length, mode: 'zip' });
    try {
      const blob = await buildZip(entries(variant), (done, total) => setStep({ kind: 'working', done, total, mode: 'zip' }), signal);
      saveBlob(blob, zipName);
      setStep({ kind: 'done' });
    } catch {
      if (!signal.aborted) setStep({ kind: 'error', variant });
    }
  }

  async function startFiles(variant: DownloadVariant) {
    abort.current = new AbortController();
    const { signal } = abort.current;
    setStep({ kind: 'working', done: 0, total: items.length, mode: 'files' });
    try {
      await downloadSequentially(entries(variant), (done, total) => setStep({ kind: 'working', done, total, mode: 'files' }), signal);
      setStep({ kind: 'done' });
    } catch {
      if (!signal.aborted) setStep({ kind: 'error', variant });
    }
  }

  return (
    <Sheet label={title} onClose={onClose} className="grid place-items-end bg-ink/70 backdrop-blur-sm sm:place-items-center">
      <div className="w-full rounded-t-[var(--radius-letter)] border border-line-dark bg-ink-soft px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-card">
        <h2 className="font-serif text-2xl font-light">{title}</h2>
        <p className="mt-1 text-xs text-cream/70">{items.length} arquivos</p>

        {step.kind === 'choose' && (
          <div className="mt-6 flex flex-col gap-3">
            <Button data-autofocus onClick={() => startZip('web')} className="w-full">
              Versão web <span className="font-normal text-ink/60">· mais leve</span>
            </Button>
            <Button variant="secondary" onClick={() => startZip('original')} className="w-full">
              Original <span className="font-normal text-cream/70">· {formatBytes(originalSize)}</span>
            </Button>
            <p className="text-xs leading-relaxed text-cream/55">
              A versão web é ideal para ver no celular e compartilhar. O original tem a qualidade máxima, para guardar e imprimir.
            </p>
          </div>
        )}

        {step.kind === 'working' && (
          <div className="mt-6 flex flex-col gap-3" aria-live="polite">
            <p className="text-sm text-cream/85">
              {step.mode === 'zip' ? 'Preparando o arquivo ZIP' : 'Baixando'}… {step.done} de {step.total}
            </p>
            <progress max={step.total} value={step.done} className="h-1 w-full appearance-none overflow-hidden rounded-full [&::-moz-progress-bar]:bg-cream [&::-webkit-progress-bar]:bg-charcoal [&::-webkit-progress-value]:bg-cream">
              {step.done} de {step.total}
            </progress>
            <p className="text-xs text-cream/55">Mantenha esta tela aberta até terminar.</p>
          </div>
        )}

        {step.kind === 'done' && (
          <p className="mt-6 text-sm text-cream/85" role="status">
            Pronto! Confira a pasta de downloads.
          </p>
        )}

        {step.kind === 'error' && (
          <div className="mt-6 flex flex-col gap-3" role="alert">
            <p className="text-sm text-red-200">Não foi possível montar o ZIP neste aparelho.</p>
            <Button onClick={() => startFiles(step.variant)} className="w-full">
              Baixar um por um
            </Button>
          </div>
        )}

        <Button variant="secondary" onClick={onClose} className="mt-4 w-full">
          {step.kind === 'working' ? 'Cancelar' : 'Fechar'}
        </Button>
      </div>
    </Sheet>
  );
}
