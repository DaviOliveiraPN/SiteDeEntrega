import { useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import type { Business, PageContent } from '../../types';
import { Button } from '../ui/Button';
import { Img } from '../ui/Img';
import { Logo } from '../ui/Logo';

/** Invitation letter: first thing the couple sees. `leaving` plays the fade-out before unmount. */
export function Letter({
  page,
  business,
  leaving,
  onOpen,
}: {
  page: PageContent;
  business: Business;
  leaving: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, !leaving);
  useScrollLock(true);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="letter-title"
      tabIndex={-1}
      className={`fixed inset-0 z-40 overflow-y-auto bg-ink outline-none transition-opacity duration-700 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <Img src={page.coverImageUrl} alt="" aria-hidden="true" className="fixed inset-0 size-full scale-110 object-cover opacity-50 blur-xl" />
      <div className="fixed inset-0 bg-ink/55" />

      <div className="relative flex min-h-full animate-fade-in flex-col items-center justify-center gap-8 px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Logo business={business} />

        <article className="w-full max-w-md rounded-letter bg-paper px-7 py-10 text-center text-ink shadow-2xl shadow-black/50 sm:px-10">
          <p className="eyebrow text-ink/60">Uma carta para vocês</p>
          <h1 id="letter-title" className="mt-5 font-serif text-4xl font-light">
            {page.coupleNames}
          </h1>
          <p className="mt-6 font-serif text-xl font-light italic leading-relaxed text-ink/80">{page.letterMessage}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-ink/30" />
            {/* muted (#8A8175) on paper is below AA for this size, so a darker ink tone is used. */}
            <p className="font-serif text-lg italic text-ink/65">Com carinho, {business.name}</p>
          </div>
        </article>

        <Button data-autofocus onClick={onOpen}>
          Abrir minha entrega <span aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  );
}
