import { useState } from 'react';
import { formatLongDate } from '../../lib/dates';
import { shareLink, type ShareOutcome } from '../../lib/share';
import type { Business, PageContent } from '../../types';
import { Button } from '../ui/Button';
import { Contact } from '../ui/Contact';
import { Logo } from '../ui/Logo';
import { Reveal } from '../ui/Reveal';

const SHARE_MESSAGES: Partial<Record<ShareOutcome, string>> = {
  copied: 'Link copiado.',
  failed: 'Não foi possível compartilhar. Copie o endereço da página.',
};

export function Closing({ page, business, onReplay }: { page: PageContent; business: Business; onReplay: () => void }) {
  const [shareStatus, setShareStatus] = useState<ShareOutcome | null>(null);

  async function onShare() {
    setShareStatus(
      await shareLink({ title: page.coupleNames, text: `As memórias de ${page.coupleNames}`, url: location.href }),
    );
  }

  return (
    <section aria-label="Encerramento" className="flex min-h-dvh flex-col items-center justify-between bg-ink px-6 pt-24 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <Reveal className="flex max-w-2xl flex-col items-center gap-8">
        <blockquote className="font-serif text-3xl leading-snug font-light italic text-cream/85 md:text-4xl">“{page.letterMessage}”</blockquote>
        <p className="flex items-center gap-3 font-serif text-lg italic text-muted">
          <span aria-hidden="true" className="h-px w-8 bg-muted/60" />
          Com carinho, {business.name}
        </p>
        <div className="mt-4 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button onClick={onShare} className="w-full sm:w-auto">
            Compartilhar este momento
          </Button>
          <Button variant="secondary" onClick={onReplay} className="w-full sm:w-auto">
            Rever desde o começo
          </Button>
        </div>
        <p role="status" className="min-h-5 text-sm text-cream/70">
          {shareStatus ? SHARE_MESSAGES[shareStatus] : null}
        </p>
      </Reveal>

      <footer className="mt-16 flex flex-col items-center gap-4">
        <Logo business={business} />
        <Contact contact={business.contact} />
        <p className="text-[11px] text-cream/55">Disponível até {formatLongDate(page.expiresAt)}</p>
      </footer>
    </section>
  );
}
