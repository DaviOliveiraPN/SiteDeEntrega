import { useMutation } from '@tanstack/react-query';
import { useId, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Logo } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Spinner';
import { ExpiredScreen } from '../components/ui/StatusScreen';
import { useBusiness } from '../hooks/queries';
import { saveSession } from '../lib/session';
import { contentService } from '../services';

const ERRORS = {
  invalid: 'Código inválido. Confira e tente novamente.',
  rate_limited: 'Muitas tentativas. Aguarde um minuto e tente de novo.',
  network: 'Não foi possível verificar agora. Tente novamente.',
} as const;

export default function Access() {
  const navigate = useNavigate();
  const { data: business } = useBusiness();
  const [code, setCode] = useState('');
  const inputId = useId();
  const errorId = useId();

  const access = useMutation({
    mutationFn: (value: string) => contentService.validateCode(value),
    onSuccess: (result) => {
      if (result.ok) {
        saveSession(result.slug, result.token);
        navigate(`/p/${result.slug}`);
      }
    },
  });

  const result = access.data;
  if (result && !result.ok && result.reason === 'expired') return <ExpiredScreen />;

  const error = access.isError ? ERRORS.network : result && !result.ok ? ERRORS[result.reason as 'invalid' | 'rate_limited'] : null;
  const loading = access.isPending || result?.ok === true;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (code.trim() && !loading) access.mutate(code.trim());
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex w-full max-w-sm animate-fade-in flex-col items-center gap-8 text-center">
        <Link to="/" aria-label="Início">
          {business && <Logo business={business} />}
        </Link>
        <div className="flex flex-col gap-3">
          <Eyebrow>Sua entrega</Eyebrow>
          <h1 className="font-serif text-3xl font-light">Digite seu código de acesso</h1>
          <p className="text-sm text-cream/70">Ele está na mensagem que enviamos para vocês.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-4">
          <label htmlFor={inputId} className="sr-only">
            Código de acesso
          </label>
          <input
            id={inputId}
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoComplete="one-time-code"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="EX.: AURORA2026K"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="min-h-12 w-full rounded-full border border-cream/25 bg-charcoal/40 px-6 text-center text-base tracking-[0.25em] text-cream uppercase placeholder:tracking-[0.2em] placeholder:text-cream/45 focus:border-cream/70 focus:outline-none aria-invalid:border-red-300/70"
          />
          <p id={errorId} role="alert" className="min-h-5 text-sm text-red-200">
            {error}
          </p>
          <Button type="submit" disabled={loading || !code.trim()} className="w-full">
            {loading ? <Spinner label="Verificando" /> : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
