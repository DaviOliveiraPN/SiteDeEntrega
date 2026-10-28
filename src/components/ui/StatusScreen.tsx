import type { ReactNode } from 'react';
import { useBusiness } from '../../hooks/queries';
import { Contact } from './Contact';
import { Eyebrow } from './Eyebrow';
import { Logo } from './Logo';

/** Centered dark screen shared by 404, expired and error states. */
export function StatusScreen({
  eyebrow,
  title,
  children,
  showContact = false,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  showContact?: boolean;
}) {
  const { data: business } = useBusiness();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-ink px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
      {business && <Logo business={business} />}
      <div className="flex max-w-sm animate-fade-in flex-col items-center gap-4">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="font-serif text-3xl font-light text-cream">{title}</h1>
        {children}
      </div>
      {showContact && business && <Contact contact={business.contact} />}
    </main>
  );
}

export function ExpiredScreen() {
  return (
    <StatusScreen eyebrow="Entrega encerrada" title="Esta entrega expirou" showContact>
      <p className="text-sm leading-relaxed text-cream/70">
        O período de acesso a estas memórias terminou. Fale com a gente para recuperar seus arquivos.
      </p>
    </StatusScreen>
  );
}
