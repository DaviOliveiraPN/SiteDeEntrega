import { useState } from "react";
import { Link } from "react-router";
import { useDeliveries } from "../../lib/deliveries.ts";
import {
  daysUntil,
  deliveryStatus,
  formatBytes,
  formatDate,
  formatDateOnly,
  sortDeliveries,
  STATUS_LABEL,
} from "../../lib/deliveryStatus.ts";

const EXPIRING_SOON_DAYS = 7;

export default function Deliveries() {
  const { data, isPending, error } = useDeliveries();
  const [now] = useState(() => Date.now());

  if (isPending) return <p>Carregando…</p>;
  if (error) return <p className="error">Não foi possível carregar as entregas.</p>;

  const rows = sortDeliveries(data, now).map((d) => ({ ...d, state: deliveryStatus(d, now) }));
  const count = (s: string) => rows.filter((r) => r.state === s).length;
  const totalBytes = rows.reduce((sum, r) => sum + r.total_bytes, 0);

  return (
    <>
      <div className="page-head">
        <h1>Entregas</h1>
        <Link className="btn" to="/admin/entregas/nova">Nova entrega</Link>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-value">{count("ativa")}</div>
          <div className="stat-label">Páginas ativas</div>
        </div>
        <div className="stat">
          <div className="stat-value">{count("espera")}</div>
          <div className="stat-label">Em espera</div>
        </div>
        <div className="stat">
          <div className="stat-value">{count("inativa")}</div>
          <div className="stat-label">Inativas</div>
        </div>
        <div className="stat">
          <div className="stat-value">{formatBytes(totalBytes)}</div>
          <div className="stat-label">Armazenamento de 10 GB</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="muted">Nenhuma entrega ainda. Toque em “Nova entrega” para começar.</p>
      ) : (
        <>
          <div className="grid-head" aria-hidden="true">
            <span>Cliente</span><span>Título</span><span>Status</span>
            <span>Evento</span><span>Expira em</span><span>Mídias</span>
          </div>
          <div className="grid-list">
            {rows.map((r) => {
              const days = daysUntil(r.expires_at, now);
              const expiringSoon = r.state === "ativa" && days <= EXPIRING_SOON_DAYS;
              return (
                <Link key={r.id} to={`/admin/entregas/${r.id}`} className="grid-row">
                  <span className="cell-name">{r.client_name}</span>
                  <span className="cell-meta cell-desktop-only">{r.title}</span>
                  <span className="cell-status">
                    <span className={`badge badge-${r.state}`}>{STATUS_LABEL[r.state]}</span>
                  </span>
                  <span className="cell-meta cell-desktop-only">{formatDateOnly(r.event_date)}</span>
                  <span className="cell-meta cell-desktop-only">
                    {expiringSoon ? <span className="badge badge-warn">{days} dia(s)</span> : formatDate(r.expires_at)}
                  </span>
                  <span className="cell-meta cell-desktop-only">{r.photo_count} fotos · {r.video_count} vídeos</span>
                  <span className="cell-meta cell-mobile-only">
                    {r.title} · {expiringSoon ? <strong className="error">expira em {days} dia(s)</strong> : `expira ${formatDate(r.expires_at)}`}
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
