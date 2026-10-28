import { ButtonLink } from '../components/ui/Button';
import { Contact } from '../components/ui/Contact';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Logo } from '../components/ui/Logo';
import { FullScreenSpinner } from '../components/ui/Spinner';
import { useBusiness } from '../hooks/queries';

const YEAR = new Date().getFullYear();

export default function Home() {
  const { data: business, isPending } = useBusiness();
  if (isPending || !business) return <FullScreenSpinner />;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between bg-ink px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
      <span />
      <div className="flex animate-fade-in flex-col items-center gap-6">
        <Logo business={business} className="h-14" />
        <Eyebrow>Fotografia & filme</Eyebrow>
        <h1 className="max-w-xs font-serif text-4xl font-light leading-tight">Suas memórias estão prontas</h1>
        <ButtonLink to="/access" className="mt-2">
          Acessar seu conteúdo
        </ButtonLink>
      </div>
      <footer className="flex flex-col items-center gap-2">
        <Contact contact={business.contact} />
        <p className="text-[11px] text-cream/55">© {YEAR} {business.name}</p>
      </footer>
    </main>
  );
}
