// Pure helpers for the admin "Entregas" screens (no Supabase import, so they are unit-testable).

export type DeliveryStatus = "ativa" | "espera" | "inativa";

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  ativa: "Ativa",
  espera: "Em espera",
  inativa: "Inativa",
};

// ativa = published and not expired · espera = draft · inativa = expired (published or not)
export function deliveryStatus(
  page: { status: "draft" | "published"; expires_at: string },
  now = Date.now(),
): DeliveryStatus {
  if (Date.parse(page.expires_at) <= now) return "inativa";
  return page.status === "draft" ? "espera" : "ativa";
}

const STATUS_RANK: Record<DeliveryStatus, number> = { ativa: 0, espera: 1, inativa: 2 };
const byName = new Intl.Collator("pt-BR", { sensitivity: "base" });

// Active first, then waiting, then inactive; by client name inside each group.
export function sortDeliveries<T extends { client_name: string; status: "draft" | "published"; expires_at: string }>(
  pages: T[],
  now = Date.now(),
): T[] {
  return [...pages].sort(
    (a, b) =>
      STATUS_RANK[deliveryStatus(a, now)] - STATUS_RANK[deliveryStatus(b, now)] ||
      byName.compare(a.client_name, b.client_name),
  );
}

export function daysUntil(iso: string, now = Date.now()): number {
  return Math.ceil((Date.parse(iso) - now) / 86_400_000);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1).replace(".", ",")} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2).replace(".", ",")} GB`;
}

// "2026-09-12" → "12/09/2026" without going through Date (avoids the UTC off-by-one day).
export function formatDateOnly(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// "Casamento Ana & Bruno" → "casamento-ana-bruno" (matches the slug check in the schema).
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
