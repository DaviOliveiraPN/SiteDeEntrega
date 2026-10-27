import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import {
  endOfDayIso,
  isUniqueViolation,
  toDateInput,
  useDelivery,
  useDeliverySections,
  useUpdateDelivery,
  type DeliverySummary,
} from "../../lib/deliveries.ts";
import { deliveryStatus, formatBytes, formatDate, slugify, STATUS_LABEL } from "../../lib/deliveryStatus.ts";

export default function DeliveryDetail() {
  const { id } = useParams() as { id: string };
  const { data, isPending, error } = useDelivery(id);

  if (isPending) return <p>Carregando…</p>;
  if (error) return <p className="error">Não foi possível carregar a entrega.</p>;
  if (!data) return <p>Entrega não encontrada. <Link to="/admin/entregas">Voltar</Link></p>;

  const state = deliveryStatus(data);

  return (
    <>
      <Link className="back-link" to="/admin/entregas">← Entregas</Link>
      <div className="page-head">
        <div>
          <h1>{data.client_name}</h1>
          <span className="muted">{data.title}</span>
        </div>
        <span className={`badge badge-${state}`}>{STATUS_LABEL[state]}</span>
      </div>

      <Totals d={data} />
      <PublishCard d={data} />
      <EditForm key={data.id} d={data} />
      <MediaCard d={data} />
    </>
  );
}

function Totals({ d }: { d: DeliverySummary }) {
  return (
    <div className="stat-row">
      <div className="stat"><div className="stat-value">{d.photo_count}</div><div className="stat-label">Fotos</div></div>
      <div className="stat"><div className="stat-value">{d.video_count}</div><div className="stat-label">Vídeos</div></div>
      <div className="stat"><div className="stat-value">{formatBytes(d.total_bytes)}</div><div className="stat-label">Armazenamento</div></div>
      <div className="stat"><div className="stat-value">{formatDate(d.expires_at)}</div><div className="stat-label">Disponível até</div></div>
    </div>
  );
}

function PublishCard({ d }: { d: DeliverySummary }) {
  const update = useUpdateDelivery(d.id);
  const published = d.status === "published";
  return (
    <section className="card">
      <h2>Publicação</h2>
      <p className="muted">
        {published
          ? "Publicada: o código de acesso funciona enquanto a entrega estiver dentro da validade."
          : "Em espera (rascunho): o cliente ainda não consegue acessar, mesmo com o código."}
      </p>
      <p className="muted">Código de acesso: {d.has_code ? "gerado" : "ainda não gerado"} · criada em {formatDate(d.created_at)}</p>
      <button
        className={`btn${published ? " btn-secondary" : ""}`}
        disabled={update.isPending}
        onClick={() => update.mutate({ status: published ? "draft" : "published" })}
      >
        {published ? "Voltar para espera" : "Publicar"}
      </button>
      {update.error && <p className="error">Não foi possível alterar a publicação.</p>}
    </section>
  );
}

function EditForm({ d }: { d: DeliverySummary }) {
  const update = useUpdateDelivery(d.id);
  const [clientName, setClientName] = useState(d.client_name);
  const [title, setTitle] = useState(d.title);
  const [slug, setSlug] = useState(d.slug);
  const [email, setEmail] = useState(d.client_email ?? "");
  const [eventDate, setEventDate] = useState(d.event_date ?? "");
  const [expiresOn, setExpiresOn] = useState(toDateInput(d.expires_at));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    update.mutate({
      client_name: clientName.trim(),
      title: title.trim(),
      slug,
      client_email: email.trim() || null,
      event_date: eventDate || null,
      expires_at: endOfDayIso(expiresOn),
    });
  }

  return (
    <section className="card">
      <h2>Dados da entrega</h2>
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="client">Nome do cliente</label>
          <input id="client" className="input" required value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="title">Título da página</label>
          <input id="title" className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="slug">Endereço</label>
          <input id="slug" className="input" required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          <small>/p/{slug}</small>
        </div>
        <div className="field">
          <label htmlFor="email">E-mail do cliente</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="event">Data do evento</label>
          <input id="event" type="date" className="input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="expires">Disponível até</label>
          <input id="expires" type="date" className="input" required value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
        </div>
        {update.error && (
          <p className="error">
            {isUniqueViolation(update.error) ? "Esse endereço já está em uso." : "Não foi possível salvar."}
          </p>
        )}
        {update.isSuccess && <p className="muted">Alterações salvas.</p>}
        <button className="btn" type="submit" disabled={update.isPending}>
          {update.isPending ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}

function MediaCard({ d }: { d: DeliverySummary }) {
  const sections = useDeliverySections(d.id);
  return (
    <section className="card">
      <h2>Imagens e vídeos</h2>
      {sections.data?.length ? (
        <ul>
          {sections.data.map((s) => (
            <li key={s.id}>{s.name}: {s.photos} fotos · {s.videos} vídeos</li>
          ))}
        </ul>
      ) : (
        <p className="muted">Nenhum momento criado ainda.</p>
      )}
      {/* TODO (build step 8): browser-side processing + direct upload to R2. */}
      <button className="btn" disabled>Adicionar fotos e vídeos</button>
      <p className="muted"><small>O envio de mídias chega quando o armazenamento (R2) estiver configurado.</small></p>
    </section>
  );
}
