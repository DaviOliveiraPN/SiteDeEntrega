import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { GallerySheet } from '../components/gallery/GallerySheet';
import { Closing } from '../components/landing/Closing';
import { Collection } from '../components/landing/Collection';
import { Hero } from '../components/landing/Hero';
import { Letter } from '../components/landing/Letter';
import { Moments } from '../components/landing/Moments';
import { Lightbox } from '../components/lightbox/Lightbox';
import { Button } from '../components/ui/Button';
import { FullScreenSpinner } from '../components/ui/Spinner';
import { ExpiredScreen, StatusScreen } from '../components/ui/StatusScreen';
import { useBusiness, usePageContent } from '../hooks/queries';
import { useOverlayHistory } from '../hooks/useOverlayHistory';
import { useSession } from '../hooks/useSession';
import { ALL, type GalleryFilter } from '../lib/gallery';
import { clearSession } from '../lib/session';
import { ContentError } from '../services';
import { usePageTheme } from '../theme/tokens';
import type { Business, MediaItem, PageContent } from '../types';

export default function ClientPage() {
  const { slug = '' } = useParams();
  const session = useSession(slug);
  const page = usePageContent(slug, session?.token ?? null);
  const business = useBusiness();

  if (!session) return <Navigate to="/access" replace />;

  if (page.error) {
    const code = page.error instanceof ContentError ? page.error.code : null;
    if (code === 'expired') return <ExpiredScreen />;
    if (code === 'unauthorized' || code === 'not_found') return <RedirectToAccess />;
    return (
      <StatusScreen title="Não foi possível carregar">
        <p className="text-sm text-cream/70">Verifique sua conexão e tente novamente.</p>
        <Button variant="secondary" onClick={() => page.refetch()} className="mt-4">
          Tentar de novo
        </Button>
      </StatusScreen>
    );
  }

  if (!page.data || !business.data) return <FullScreenSpinner />;
  return <Delivery page={page.data} business={business.data} />;
}

function RedirectToAccess() {
  useEffect(() => clearSession(), []);
  return <Navigate to="/access" replace />;
}

type Phase = 'letter' | 'opening' | 'landing';
const LETTER_FADE_MS = 700;

function Delivery({ page, business }: { page: PageContent; business: Business }) {
  const [phase, setPhase] = useState<Phase>('letter');
  const [gallery, setGallery] = useState<GalleryFilter | null>(null);
  const [lightbox, setLightbox] = useState<{ items: MediaItem[]; index: number } | null>(null);

  const closeGallery = useOverlayHistory('gallery', gallery !== null, () => setGallery(null));
  const closeLightbox = useOverlayHistory('lightbox', lightbox !== null, () => setLightbox(null));
  usePageTheme(page.theme);

  const setLightboxIndex = useCallback((index: number) => setLightbox((lb) => lb && { ...lb, index }), []);

  useEffect(() => {
    if (phase !== 'opening') return;
    const timer = setTimeout(() => setPhase('landing'), LETTER_FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  function replay() {
    window.scrollTo({ top: 0 });
    setPhase('letter');
  }

  const openLightbox = (items: MediaItem[], index: number) => setLightbox({ items, index });

  return (
    <div className="bg-ink text-cream">
      {phase !== 'letter' && (
        <main className="animate-fade-in" inert={gallery !== null || lightbox !== null}>
          <Hero page={page} business={business} onPlayOpening={(video) => openLightbox([video], 0)} />
          <Collection page={page} onPlay={openLightbox} onOpenGallery={() => setGallery(ALL)} />
          <Moments page={page} onOpenSection={(sectionId) => setGallery({ type: 'all', sectionId })} />
          <Closing page={page} business={business} onReplay={replay} />
        </main>
      )}

      {phase !== 'landing' && <Letter page={page} business={business} leaving={phase === 'opening'} onOpen={() => setPhase('opening')} />}

      {gallery && <GallerySheet page={page} initialFilter={gallery} onClose={closeGallery} onOpenItem={openLightbox} covered={lightbox !== null} />}

      {lightbox && (
        <Lightbox page={page} items={lightbox.items} index={lightbox.index} onIndexChange={setLightboxIndex} onClose={closeLightbox} />
      )}
    </div>
  );
}
