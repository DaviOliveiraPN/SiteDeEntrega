import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { supabase } from "./supabase.ts";
import { useSession } from "./useSession.ts";

// RLS only lets a user read their own row in `admins`, so a row back = is admin.
function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return data !== null;
    },
  });
}

// UI guard only: the real protection is RLS on the database.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const session = useSession();
  const isAdmin = useIsAdmin(session?.user.id);

  if (session === null) return <Navigate to="/admin/login" replace />;
  if (session === undefined || isAdmin.isPending) return <p className="container">Carregando…</p>;
  if (!isAdmin.data) {
    return (
      <main className="container">
        <h1>Sem acesso</h1>
        <p>Esta conta não tem permissão de administradora.</p>
        <button className="btn" onClick={() => supabase.auth.signOut()}>Sair</button>
      </main>
    );
  }
  return children;
}
