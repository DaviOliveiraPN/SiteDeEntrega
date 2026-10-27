import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase.ts";

// Row of the `page_summaries` view (pages + media totals). RLS: admin only.
export type DeliverySummary = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_email: string | null;
  event_date: string | null;
  status: "draft" | "published";
  expires_at: string;
  media_deleted_at: string | null;
  created_at: string;
  has_code: boolean;
  photo_count: number;
  video_count: number;
  total_bytes: number;
};

export type DeliveryInput = {
  client_name: string;
  title: string;
  slug: string;
  client_email: string | null;
  event_date: string | null;
  expires_at: string;
};

export type SectionTotals = { id: string; name: string; photos: number; videos: number };

const keys = {
  all: ["deliveries"] as const,
  one: (id: string) => ["deliveries", id] as const,
  sections: (id: string) => ["deliveries", id, "sections"] as const,
};

export function useDeliveries() {
  return useQuery({
    queryKey: keys.all,
    queryFn: async () => {
      const { data, error } = await supabase.from("page_summaries").select("*");
      if (error) throw error;
      return data as DeliverySummary[];
    },
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: keys.one(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("page_summaries").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as DeliverySummary | null;
    },
  });
}

// Sections ("momentos") with how many photos/videos each holds.
export function useDeliverySections(pageId: string) {
  return useQuery({
    queryKey: keys.sections(pageId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("id, name, media(type)")
        .eq("page_id", pageId)
        .order("order");
      if (error) throw error;
      return data.map((s): SectionTotals => ({
        id: s.id,
        name: s.name,
        photos: s.media.filter((m: { type: string }) => m.type === "photo").length,
        videos: s.media.filter((m: { type: string }) => m.type === "video").length,
      }));
    },
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DeliveryInput) => {
      const { data, error } = await supabase.from("pages").insert(input).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateDelivery(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<DeliveryInput> & { status?: "draft" | "published" }) => {
      const { error } = await supabase.from("pages").update(patch).eq("id", id);
      if (error) throw error;
    },
    // Invalidates the list and this delivery (prefix match on ["deliveries"]).
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

// Postgres unique violation → the slug is taken.
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

// <input type="date"> value → end of that day in the admin's time zone.
export function endOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59`).toISOString();
}

// ISO timestamp → <input type="date"> value in the admin's time zone.
export function toDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
