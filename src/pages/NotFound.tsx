import { ButtonLink } from '../components/ui/Button';
import { StatusScreen } from '../components/ui/StatusScreen';

export default function NotFound() {
  return (
    <StatusScreen eyebrow="Erro 404" title="Página não encontrada">
      <p className="text-sm text-cream/70">O endereço pode ter sido digitado errado ou não existe mais.</p>
      <ButtonLink to="/" variant="secondary" className="mt-4">
        Voltar ao início
      </ButtonLink>
    </StatusScreen>
  );
}
