import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { endOfDayIso, isUniqueViolation, toDateInput, useCreateDelivery } from "../../lib/deliveries.ts";
import { slugify } from "../../lib/deliveryStatus.ts";

const DEFAULT_VALID_DAYS = 90;

export default function NewDelivery() {
  const navigate = useNavigate();
  const create = useCreateDelivery();

  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [expiresOn, setExpiresOn] = useState(() =>
    toDateInput(new Date(Date.now() + DEFAULT_VALID_DAYS * 86_400_000).toISOString()),
  );

  // The URL follows the title until the admin edits it by hand.
  const effectiveSlug = slugEdited ? slug : slugify(title || clientName);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const id = await create.mutateAsync({
      client_name: clientName.trim(),
      title: title.trim() || clientName.trim(),
      slug: effectiveSlug,
      client_email: email.trim() || null,
      event_date: eventDate || null,
      expires_at: endOfDayIso(expiresOn),
    });
    navigate(`/admin/entregas/${id}`);
  }

  return (
    <>
      <Link className="back-link" to="/admin/entregas">← Entregas</Link>
      <div className="page-head"><h1>Nova entrega</h1></div>

      <form className="form" onSubmit={(e) => onSubmit(e).catch(() => {})}>
        <div className="field">
          <label htmlFor="client">Nome do cliente *</label>
          <input id="client" className="input" required value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="title">Título da página</label>
          <input id="title" className="input" placeholder="Casamento Ana & Bruno" value={title} onChange={(e) => setTitle(e.target.value)} />
          <small>Se ficar vazio, usamos o nome do cliente.</small>
        </div>

        <div className="field">
          <label htmlFor="slug">Endereço</label>
          <input
            id="slug"
            className="input"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={effectiveSlug}
            onChange={(e) => { setSlugEdited(true); setSlug(slugify(e.target.value)); }}
          />
          <small>/p/{effectiveSlug || "…"}</small>
        </div>

        <div className="field">
          <label htmlFor="email">E-mail do cliente</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <small>Para enviar o convite. Opcional: dá para mandar pelo WhatsApp.</small>
        </div>

        <div className="field">
          <label htmlFor="event">Data do evento</label>
          <input id="event" type="date" className="input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="expires">Disponível até *</label>
          <input id="expires" type="date" className="input" required value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
          <small>Padrão: {DEFAULT_VALID_DAYS} dias. A entrega começa em espera (rascunho).</small>
        </div>

        {create.error && (
          <p className="error">
            {isUniqueViolation(create.error) ? "Esse endereço já está em uso. Escolha outro." : "Não foi possível criar a entrega."}
          </p>
        )}

        <button className="btn" type="submit" disabled={create.isPending}>
          {create.isPending ? "Criando…" : "Criar entrega"}
        </button>
      </form>
    </>
  );
}
